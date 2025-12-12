// supabase.js - 修复版本
console.log('开始加载 Supabase 模块...');

// 方案A：直接使用你的真实密钥（部署后建议替换为环境变量）
// 注意：请将以下示例密钥替换成你自己的！
const SUPABASE_URL = 'https://ehgeipiwdvnhgbynpbxv.supabase.co'; // 替换为你的Project URL
const SUPABASE_KEY = 'sb_publishable_rU03ENnG0xoOjNI19Iigbw_foCyY8LF'; // 替换为你的anon key

// 方案B：从Netlify环境变量读取（更安全）
// const SUPABASE_URL = window.env?.VITE_SUPABASE_URL || 'https://ehgeipiwdvnhgbynpbxv.supabase.co';
// const SUPABASE_KEY = window.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rU03ENnG0xoOjNI19Iigbw_foCyY8LF';

// 全局Supabase客户端实例
let _supabase = null;

/**
 * 初始化Supabase客户端
 */
function initSupabase() {
    if (_supabase) return _supabase;
    
    try {
        if (!window.supabase || !window.supabase.createClient) {
            throw new Error('Supabase客户端库未加载，请检查CDN链接');
        }
        
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: false
            }
        });
        
        console.log('Supabase客户端初始化成功');
        return _supabase;
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        // 不阻塞页面加载，但记录错误
        return null;
    }
}

/**
 * 提交获奖记录到云端
 */
window.submitAwardRecord = async (studentName, studentMajor, competitions) => {
    const supabase = initSupabase();
    if (!supabase) {
        return { success: false, message: '数据库连接失败，请刷新页面重试' };
    }
    
    try {
        console.log('提交数据到云端:', { studentName, studentMajor, competitions });
        
        if (!studentName || !studentMajor) {
            return { success: false, message: '请填写完整的个人信息' };
        }
        
        if (!competitions || competitions.length === 0) {
            return { success: false, message: '请至少添加一个竞赛信息' };
        }
        
        // 1. 插入学生信息
        const { data: studentData, error: studentError } = await supabase
            .from('students')
            .insert([{ 
                name: studentName, 
                major: studentMajor 
            }])
            .select('id')
            .single();

        if (studentError) {
            console.error('插入学生信息失败:', studentError);
            return { 
                success: false, 
                message: `保存学生信息失败: ${studentError.message}` 
            };
        }
        
        const studentId = studentData.id;
        console.log('学生信息保存成功，ID:', studentId);
        
        // 2. 验证竞赛数据
        const validCompetitions = competitions.filter(comp => 
            comp.grade && comp.competitionName && comp.level && comp.award
        );
        
        if (validCompetitions.length === 0) {
            // 删除刚插入的学生记录
            await supabase.from('students').delete().eq('id', studentId);
            return { 
                success: false, 
                message: '请填写完整的竞赛信息（年级、名称、级别、等级）' 
            };
        }
        
        // 3. 准备竞赛数据
        const competitionsToInsert = validCompetitions.map(comp => ({
            student_id: studentId,
            grade: comp.grade,
            competition_name: comp.competitionName,
            level: comp.level,
            award: comp.award,
            certificate_url: comp.certificateUrl || null
        }));
        
        // 4. 批量插入竞赛信息
        const { error: compError } = await supabase
            .from('competitions')
            .insert(competitionsToInsert);
            
        if (compError) {
            console.error('插入竞赛信息失败:', compError);
            // 尝试清理学生记录
            await supabase.from('students').delete().eq('id', studentId);
            return { 
                success: false, 
                message: `保存竞赛信息失败: ${compError.message}` 
            };
        }
        
        console.log('全部数据提交成功！');
        return { 
            success: true, 
            message: '提交成功！数据已安全保存至云端。' 
        };
        
    } catch (error) {
        console.error('提交过程异常:', error);
        return { 
            success: false, 
            message: `提交失败: ${error.message}` 
        };
    }
};

/**
 * 验证管理员密码（简化版）
 */
window.verifyAdminPassword = async (inputPassword) => {
    const supabase = initSupabase();
    if (!supabase) {
        return { success: false, message: '数据库连接失败' };
    }
    
    try {
        // 简化验证：直接比较固定密码
        const correctPassword = 'h20041214';
        
        if (inputPassword === correctPassword) {
            return { success: true, message: '验证通过！' };
        } else {
            return { success: false, message: '密码错误！' };
        }
    } catch (error) {
        console.error('密码验证异常:', error);
        return { success: false, message: '验证过程出错，请重试' };
    }
};

/**
 * 获取筛选后的数据
 */
window.fetchFilteredData = async (filters = {}) => {
    const supabase = initSupabase();
    if (!supabase) return [];
    
    try {
        console.log('获取数据，筛选条件:', filters);
        
        let query = supabase
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
        
        // 应用筛选条件
        if (filters.name && filters.name.trim()) {
            query = query.ilike('students.name', `%${filters.name.trim()}%`);
        }
        if (filters.competition && filters.competition.trim()) {
            query = query.ilike('competition_name', `%${filters.competition.trim()}%`);
        }
        if (filters.level && filters.level.trim()) {
            query = query.eq('level', filters.level);
        }
        if (filters.grade && filters.grade.trim()) {
            query = query.eq('grade', filters.grade);
        }
        if (filters.award && filters.award.trim()) {
            query = query.eq('award', filters.award);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('查询数据失败:', error);
            return [];
        }
        
        // 格式化数据
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
        return [];
    }
};

/**
 * 删除记录
 */
window.deleteAwardRecord = async (recordId) => {
    const supabase = initSupabase();
    if (!supabase) {
        return { success: false, message: '数据库连接失败' };
    }
    
    try {
        const { error } = await supabase
            .from('competitions')
            .delete()
            .eq('id', recordId);
            
        if (error) {
            console.error('删除记录失败:', error);
            return { success: false, message: `删除失败: ${error.message}` };
        }
        
        return { success: true, message: '删除成功！' };
    } catch (error) {
        console.error('删除过程异常:', error);
        return { success: false, message: `删除失败: ${error.message}` };
    }
};

/**
 * 更新记录
 */
window.updateAwardRecord = async (recordId, updateData) => {
    const supabase = initSupabase();
    if (!supabase) {
        return { success: false, message: '数据库连接失败' };
    }
    
    try {
        const { error } = await supabase
            .from('competitions')
            .update({
                grade: updateData.grade,
                competition_name: updateData.competition,
                level: updateData.level,
                award: updateData.award
            })
            .eq('id', recordId);
            
        if (error) {
            console.error('更新记录失败:', error);
            return { success: false, message: `更新失败: ${error.message}` };
        }
        
        return { success: true, message: '更新成功！' };
    } catch (error) {
        console.error('更新过程异常:', error);
        return { success: false, message: `更新失败: ${error.message}` };
    }
};

// 初始化Supabase
initSupabase();
console.log('Supabase API模块加载完成');
