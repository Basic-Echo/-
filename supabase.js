// supabase.js - 修复版（适用于纯静态部署）
console.log('开始加载 Supabase 模块...');

// 方案A：直接使用你的真实密钥（部署后替换为环境变量方案B）
// 注意：以下示例密钥需要替换成你自己的！
const SUPABASE_URL = 'https://ehgeipiwdvnhgbynpbxv.supabase.co'; // 替换为你的Project URL
const SUPABASE_KEY = 'sb_publishable_rU03ENnG0xoOjNI19Iigbw_foCyY8LF'; // 替换为你的anon key

// 方案B：从全局变量读取（由Netlify注入）- 更安全但需要额外配置
// const SUPABASE_URL = window.SUPABASE_URL || 'https://ehgeipiwdvnhgbynpbxv.supabase.co';
// const SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_rU03ENnG0xoOjNI19Iigbw_foCyY8LF';

// 初始化Supabase客户端
let _supabase;
try {
  if (!window.supabase) {
    throw new Error('Supabase客户端库未加载，请检查网络或CDN链接');
  }
  _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase客户端初始化成功');
} catch (error) {
  console.error('Supabase初始化失败:', error);
  alert('数据库连接初始化失败，请刷新页面重试或联系管理员。');
}

/**
 * 提交获奖记录到云端
 */
window.submitAwardRecord = async (studentName, studentMajor, competitions) => {
  if (!_supabase) return { success: false, message: '数据库连接未就绪' };
  
  try {
    console.log('提交数据:', { studentName, studentMajor, competitions });
    
    // 1. 插入学生信息
    const { data: studentData, error: studentError } = await _supabase
      .from('students')
      .insert([{ name: studentName, major: studentMajor }])
      .select('id')
      .single();

    if (studentError) throw new Error(`学生信息保存失败: ${studentError.message}`);
    
    const studentId = studentData.id;
    console.log('学生ID:', studentId);
    
    // 2. 准备竞赛数据
    const competitionsToInsert = competitions.map(comp => ({
      student_id: studentId,
      grade: comp.grade,
      competition_name: comp.competitionName,
      level: comp.level,
      award: comp.award,
      certificate_url: null
    }));
    
    // 3. 插入竞赛信息
    const { error: compError } = await _supabase
      .from('competitions')
      .insert(competitionsToInsert);
      
    if (compError) throw new Error(`竞赛信息保存失败: ${compError.message}`);
    
    return { success: true, message: '提交成功！数据已保存。' };
    
  } catch (error) {
    console.error('提交出错:', error);
    return { success: false, message: error.message };
  }
};

/**
 * 验证管理员密码（简化版，直接比较）
 */
window.verifyAdminPassword = async (inputPassword) => {
  try {
    // 简化验证：直接比较固定密码
    if (inputPassword === 'h20041214') {
      return { success: true, message: '验证通过！' };
    } else {
      return { success: false, message: '密码错误！' };
    }
  } catch (error) {
    console.error('验证出错:', error);
    return { success: false, message: '验证过程出错' };
  }
};

/**
 * 获取筛选数据（简化版，先获取全部）
 */
window.fetchFilteredData = async (filters = {}) => {
  if (!_supabase) return [];
  
  try {
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
        students!inner (name, major)
      `)
      .order('created_at', { ascending: false });
    
    // 应用筛选条件（简化实现）
    if (filters.name) {
      query = query.ilike('students.name', `%${filters.name}%`);
    }
    if (filters.competition) {
      query = query.ilike('competition_name', `%${filters.competition}%`);
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
    
    const { data, error } = await query;
    if (error) throw error;
    
    // 格式化数据
    return data.map(item => ({
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
    
  } catch (error) {
    console.error('获取数据失败:', error);
    return [];
  }
};

/**
 * 删除记录
 */
window.deleteAwardRecord = async (recordId) => {
  if (!_supabase) return { success: false, message: '数据库未连接' };
  
  try {
    const { error } = await _supabase
      .from('competitions')
      .delete()
      .eq('id', recordId);
      
    if (error) throw error;
    return { success: true, message: '删除成功！' };
  } catch (error) {
    console.error('删除失败:', error);
    return { success: false, message: '删除失败: ' + error.message };
  }
};

console.log('Supabase API模块加载完成');
