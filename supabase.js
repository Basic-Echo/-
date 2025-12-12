// supabase.js - 连接并操作云端数据库的核心文件
// 注意：在Netlify部署时，以下两个变量会由环境变量自动注入。
// 本地测试时，可以直接写死（但注意不要上传包含真实密钥的代码）。
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ehgeipiwdvnhgbynpbxv.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rU03ENnG0xoOjNI19Iigbw_foCyY8LF';

// 初始化Supabase客户端
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase客户端初始化完成');

/**
 * 核心函数：向云端数据库提交一份完整的获奖记录
 * @param {string} studentName - 学生姓名
 * @param {string} studentMajor - 学生专业
 * @param {Array} competitions - 竞赛信息数组
 * @returns {Promise<Object>} - 返回 {success, message}
 */
window.submitAwardRecord = async (studentName, studentMajor, competitions) => {
  try {
    // 1. 插入学生信息到 `students` 表
    const { data: studentData, error: studentError } = await _supabase
      .from('students')
      .insert([{ name: studentName, major: studentMajor }])
      .select('id') // 返回插入后生成的id
      .single();

    if (studentError) {
      console.error('插入学生信息失败:', studentError);
      throw new Error(`数据库错误: ${studentError.message}`);
    }

    const studentId = studentData.id;
    console.log(`学生信息保存成功，ID: ${studentId}`);

    // 2. 准备竞赛数据，关联上学生ID
    const competitionsToInsert = competitions.map(comp => ({
      student_id: studentId,
      grade: comp.grade,
      competition_name: comp.competitionName,
      level: comp.level,
      award: comp.award,
      certificate_url: comp.certificateUrl || null // 处理图片URL，当前版本暂未实现图片上传
    }));

    // 3. 批量插入竞赛信息到 `competitions` 表
    const { error: compError } = await _supabase
      .from('competitions')
      .insert(competitionsToInsert);

    if (compError) {
      console.error('插入竞赛信息失败:', compError);
      // 尝试清理已插入的学生记录（可选）
      await _supabase.from('students').delete().eq('id', studentId);
      throw new Error(`保存竞赛信息失败: ${compError.message}`);
    }

    console.log('全部数据提交成功！');
    return {
      success: true,
      message: `提交成功！您的记录ID为 ${studentId}。`
    };

  } catch (error) {
    console.error('提交过程中出现异常:', error);
    return {
      success: false,
      message: `提交失败: ${error.message}`
    };
  }
};

/**
 * 管理员登录验证
 * @param {string} inputPassword - 用户输入的密码
 * @returns {Promise<Object>} - 返回 {success, message}
 */
window.verifyAdminPassword = async (inputPassword) => {
  try {
    // 从 `admins` 表中查询用户名为 'admin' 的记录
    const { data, error } = await _supabase
      .from('admins')
      .select('password_hash')
      .eq('username', 'admin')
      .maybeSingle(); // 使用 maybeSingle 避免查询不到时报错

    if (error || !data) {
      console.error('查询管理员账户失败:', error);
      return { success: false, message: '系统错误：管理员账户不存在或查询失败。' };
    }

    // 注意：这里假设你在Supabase中创建admins表时，使用crypt()函数加密了密码。
    // 因此，我们需要调用Supabase的rpc（存储过程）来进行密码比对。
    // 你需要先在Supabase中创建这个rpc函数（见下方补充说明）。
    const { error: authError } = await _supabase.rpc('verify_admin_password', {
      input_password: inputPassword,
      stored_hash: data.password_hash
    });

    if (authError) {
      console.error('密码验证失败:', authError);
      return { success: false, message: '密码错误！' };
    }

    return { success: true, message: '验证通过！' };

  } catch (error) {
    console.error('登录验证过程异常:', error);
    return { success: false, message: '登录验证出现未知错误。' };
  }
};

/**
 * 从云端获取筛选后的获奖数据
 * @param {Object} filters - 筛选条件对象
 * @returns {Promise<Array>} - 返回格式化后的数据数组
 */
window.fetchFilteredData = async (filters = {}) => {
  try {
    // 构建查询：联表查询 competitions 和 students
    let query = _supabase
      .from('competitions')
      .select(`
        id,
        grade,
        competition_name,
        level,
        award,
        certificate_url,
        created_at,
        students!inner ( name, major )
      `);

    // 动态应用筛选条件
    if (filters.name && filters.name.trim() !== '') {
      query = query.ilike('students.name', `%${filters.name.trim()}%`);
    }
    if (filters.competition && filters.competition.trim() !== '') {
      query = query.ilike('competition_name', `%${filters.competition.trim()}%`);
    }
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    if (filters.grade) {
      query = query.eq('grade', filters.grade);
    }
    if (filters.award) {
      query = query.eq('award', filters.award);
    }

    // 按提交时间降序排列
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('获取数据失败:', error);
      throw error;
    }

    // 将数据格式化为前端表格需要的结构
    const formattedData = data.map(item => ({
      recordId: item.id,
      name: item.students.name,
      major: item.students.major,
      grade: item.grade,
      competition: item.competition_name,
      level: item.level,
      award: item.award,
      certificate: item.certificate_url,
      submitTime: new Date(item.created_at).toLocaleString('zh-CN')
    }));

    console.log(`成功获取 ${formattedData.length} 条数据`);
    return formattedData;

  } catch (error) {
    console.error('获取数据过程异常:', error);
    return []; // 出错时返回空数组
  }
};

/**
 * 更新单条竞赛记录
 * @param {number} recordId - 要更新的竞赛记录ID (competitions表里的id)
 * @param {Object} updateData - 要更新的字段 {name, major, grade, competition, level, award}
 * @returns {Promise<Object>} - 返回 {success, message}
 */
window.updateAwardRecord = async (recordId, updateData) => {
  try {
    // 注意：这里涉及更新两张表（students 和 competitions），逻辑较复杂。
    // 简化版：我们先更新竞赛记录本身，学生姓名和专业更新暂不在此版本实现。
    // 更完善的版本需要使用事务或Supabase的存储过程。
    const { error } = await _supabase
      .from('competitions')
      .update({
        grade: updateData.grade,
        competition_name: updateData.competition,
        level: updateData.level,
        award: updateData.award
      })
      .eq('id', recordId);

    if (error) throw error;
    return { success: true, message: '更新成功！' };

  } catch (error) {
    console.error('更新记录失败:', error);
    return { success: false, message: `更新失败: ${error.message}` };
  }
};

/**
 * 删除单条竞赛记录
 * @param {number} recordId - 要删除的竞赛记录ID (competitions表里的id)
 * @returns {Promise<Object>} - 返回 {success, message}
 */
window.deleteAwardRecord = async (recordId) => {
  try {
    const { error } = await _supabase
      .from('competitions')
      .delete()
      .eq('id', recordId);

    if (error) throw error;
    return { success: true, message: '删除成功！' };

  } catch (error) {
    console.error('删除记录失败:', error);
    return { success: false, message: `删除失败: ${error.message}` };
  }
};

console.log('Supabase API模块加载完毕。');