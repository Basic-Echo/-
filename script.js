// script.js - 修复版本
console.log('script.js 开始加载');

// ==================== 全局辅助函数 ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorSummary(errorMessages) {
    let errorSummary = document.getElementById('errorSummary');
    if (!errorSummary) {
        errorSummary = document.createElement('div');
        errorSummary.id = 'errorSummary';
        errorSummary.className = 'error-summary';
        document.getElementById('awardForm').prepend(errorSummary);
    }
    
    errorSummary.innerHTML = `
        <div class="error-header">
            <i class="error-icon">⚠️</i>
            <h3>请完善以下信息后再提交：</h3>
        </div>
        <ul class="error-list">
            ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
        </ul>
    `;
    errorSummary.style.display = 'block';
}

function clearErrorSummary() {
    const errorSummary = document.getElementById('errorSummary');
    if (errorSummary) {
        errorSummary.style.display = 'none';
    }
}

// ==================== 竞赛模块管理 ====================
let moduleCounter = 0;

function addCompetitionModule() {
    const competitionModules = document.getElementById('competitionModules');
    const moduleId = moduleCounter++;
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'competition-module';
    moduleDiv.dataset.moduleId = moduleId;
    
    moduleDiv.innerHTML = `
        <h3>竞赛 ${moduleId + 1} <small>(点击展开/收起)</small></h3>
        <button type="button" class="delete-module" onclick="deleteModule(this)">×</button>
        
        <div class="module-content" style="display: block;">
            <div class="form-group">
                <label for="grade-${moduleId}">获奖年级 *</label>
                <select id="grade-${moduleId}" required>
                    <option value="">请选择年级</option>
                    <option value="大一">大一</option>
                    <option value="大二">大二</option>
                    <option value="大三">大三</option>
                    <option value="大四">大四</option>
                </select>
                <span class="error-message" id="gradeError-${moduleId}"></span>
            </div>
            <div class="form-group">
                <label for="competition-${moduleId}">竞赛名称 *</label>
                <input type="text" id="competition-${moduleId}" required placeholder="如：全国大学生数学建模竞赛">
                <span class="error-message" id="competitionError-${moduleId}"></span>
            </div>
            <div class="form-group">
                <label for="level-${moduleId}">竞赛级别 *</label>
                <select id="level-${moduleId}" required>
                    <option value="">请选择级别</option>
                    <option value="校级">校级</option>
                    <option value="省级">省级</option>
                    <option value="国家级">国家级</option>
                </select>
                <span class="error-message" id="levelError-${moduleId}"></span>
            </div>
            <div class="form-group">
                <label for="award-${moduleId}">获奖等级 *</label>
                <select id="award-${moduleId}" required>
                    <option value="">请选择等级</option>
                    <option value="特等奖">特等奖</option>
                    <option value="一等奖">一等奖</option>
                    <option value="二等奖">二等奖</option>
                    <option value="三等奖">三等奖</option>
                </select>
                <span class="error-message" id="awardError-${moduleId}"></span>
            </div>
            <div class="form-group">
                <label for="certificate-${moduleId}">获奖凭证（图片）</label>
                <input type="file" id="certificate-${moduleId}" accept="image/*">
                <div class="image-preview" id="preview-${moduleId}"></div>
            </div>
        </div>
    `;
    
    competitionModules.appendChild(moduleDiv);
    
    // 添加模块标题点击事件（展开/收起）
    const title = moduleDiv.querySelector('h3');
    const content = moduleDiv.querySelector('.module-content');
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
    });
    
    // 添加图片预览
    const fileInput = moduleDiv.querySelector(`#certificate-${moduleId}`);
    const preview = moduleDiv.querySelector(`#preview-${moduleId}`);
    
    fileInput.addEventListener('change', function() {
        previewImage(this, moduleId);
    });
    
    console.log(`添加竞赛模块 #${moduleId}`);
    return moduleId;
}

function deleteModule(button) {
    const moduleDiv = button.closest('.competition-module');
    const modulesContainer = document.getElementById('competitionModules');
    
    if (modulesContainer.children.length > 1) {
        moduleDiv.remove();
        // 重新编号
        renumberModules();
    } else {
        alert('至少需要保留一个竞赛信息模块！');
    }
}

function renumberModules() {
    const modules = document.querySelectorAll('.competition-module');
    modules.forEach((module, index) => {
        const title = module.querySelector('h3');
        title.innerHTML = `竞赛 ${index + 1} <small>(点击展开/收起)</small>`;
        
        // 更新所有ID
        ['grade', 'competition', 'level', 'award', 'certificate', 'preview'].forEach(prefix => {
            const oldId = `${prefix}-${module.dataset.moduleId}`;
            const newId = `${prefix}-${index}`;
            
            const element = module.querySelector(`#${oldId}`);
            if (element) {
                element.id = newId;
                element.name = newId;
            }
            
            // 更新错误信息ID
            const errorElement = module.querySelector(`#${oldId}Error`);
            if (errorElement) {
                errorElement.id = `${newId}Error`;
            }
        });
        
        module.dataset.moduleId = index;
    });
    moduleCounter = modules.length;
}

function previewImage(input, moduleId) {
    const preview = document.getElementById(`preview-${moduleId}`);
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // 验证文件大小和类型
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            input.value = '';
            return;
        }
        
        if (!file.type.match('image.*')) {
            alert('请选择图片文件（JPG、PNG等）');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="预览" style="max-width: 200px;">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// ==================== 表单验证 ====================
function validateForm() {
    let isValid = true;
    const errors = [];
    
    // 清除之前的错误信息
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // 验证姓名
    const name = document.getElementById('name').value.trim();
    if (!name) {
        document.getElementById('nameError').textContent = '请输入姓名';
        errors.push('请输入姓名');
        isValid = false;
    }
    
    // 验证专业
    const major = document.getElementById('major').value;
    if (!major) {
        document.getElementById('majorError').textContent = '请选择专业';
        errors.push('请选择专业');
        isValid = false;
    }
    
    // 验证竞赛信息
    const modules = document.querySelectorAll('.competition-module');
    if (modules.length === 0) {
        errors.push('请至少添加一个竞赛信息');
        isValid = false;
    } else {
        modules.forEach((module, index) => {
            const moduleNum = index + 1;
            
            // 验证年级
            const grade = document.getElementById(`grade-${index}`)?.value;
            if (!grade) {
                document.getElementById(`gradeError-${index}`).textContent = '请选择年级';
                errors.push(`竞赛${moduleNum}: 请选择获奖年级`);
                isValid = false;
            }
            
            // 验证竞赛名称
            const competition = document.getElementById(`competition-${index}`)?.value.trim();
            if (!competition) {
                document.getElementById(`competitionError-${index}`).textContent = '请输入竞赛名称';
                errors.push(`竞赛${moduleNum}: 请输入竞赛名称`);
                isValid = false;
            }
            
            // 验证竞赛级别
            const level = document.getElementById(`level-${index}`)?.value;
            if (!level) {
                document.getElementById(`levelError-${index}`).textContent = '请选择级别';
                errors.push(`竞赛${moduleNum}: 请选择竞赛级别`);
                isValid = false;
            }
            
            // 验证获奖等级
            const award = document.getElementById(`award-${index}`)?.value;
            if (!award) {
                document.getElementById(`awardError-${index}`).textContent = '请选择等级';
                errors.push(`竞赛${moduleNum}: 请选择获奖等级`);
                isValid = false;
            }
        });
    }
    
    if (!isValid) {
        showErrorSummary(errors);
    } else {
        clearErrorSummary();
    }
    
    return isValid;
}

function collectCompetitionData() {
    const modules = document.querySelectorAll('.competition-module');
    const competitions = [];
    
    modules.forEach((module, index) => {
        const competition = {
            grade: document.getElementById(`grade-${index}`)?.value || '',
            competitionName: document.getElementById(`competition-${index}`)?.value.trim() || '',
            level: document.getElementById(`level-${index}`)?.value || '',
            award: document.getElementById(`award-${index}`)?.value || '',
            certificateUrl: null
        };
        
        // 处理图片上传（简化版，暂不实现）
        competitions.push(competition);
    });
    
    return competitions;
}

// ==================== 提交页面逻辑 ====================
function initSubmitPage() {
    console.log('初始化提交页面');
    
    // 确保至少有一个竞赛模块
    addCompetitionModule();
    
    // 绑定事件
    const addModuleBtn = document.getElementById('addModule');
    const awardForm = document.getElementById('awardForm');
    const resetBtn = document.getElementById('resetBtn');
    
    if (addModuleBtn) {
        addModuleBtn.addEventListener('click', () => {
            console.log('点击添加竞赛信息按钮');
            addCompetitionModule();
            clearErrorSummary();
        });
    } else {
        console.error('未找到添加竞赛信息按钮');
    }
    
    if (awardForm) {
        awardForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', handleFormReset);
    }
    
    // 绑定成功弹窗事件
    const successModal = document.getElementById('successModal');
    if (successModal) {
        const modalClose = successModal.querySelector('.close');
        const resetFormBtn = document.getElementById('resetFormBtn');
        const browseDataBtn = document.getElementById('browseDataBtn');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => successModal.style.display = 'none');
        }
        
        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                successModal.style.display = 'none';
                handleFormReset();
            });
        }
        
        if (browseDataBtn) {
            browseDataBtn.addEventListener('click', () => {
                window.location.href = 'browse.html';
            });
        }
        
        // 点击外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.style.display = 'none';
            }
        });
    }
    
    console.log('提交页面初始化完成');
}

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('处理表单提交');
    
    // 验证表单
    if (!validateForm()) {
        console.log('表单验证失败');
        return;
    }
    
    // 收集数据
    const studentName = document.getElementById('name').value.trim();
    const studentMajor = document.getElementById('major').value;
    const competitions = collectCompetitionData();
    
    console.log('提交数据:', { studentName, studentMajor, competitions });
    
    // 显示加载状态
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '提交中...';
    submitBtn.disabled = true;
    
    try {
        const result = await window.submitAwardRecord(studentName, studentMajor, competitions);
        console.log('提交结果:', result);
        
        if (result.success) {
            document.getElementById('successModal').style.display = 'block';
        } else {
            alert('提交失败: ' + result.message);
        }
    } catch (error) {
        console.error('提交异常:', error);
        alert('提交过程中发生错误，请稍后重试');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function handleFormReset() {
    console.log('重置表单');
    document.getElementById('awardForm').reset();
    
    // 清空所有竞赛模块，只保留一个
    const modulesContainer = document.getElementById('competitionModules');
    modulesContainer.innerHTML = '';
    moduleCounter = 0;
    addCompetitionModule();
    
    // 清空所有错误信息
    clearErrorSummary();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.image-preview').forEach(el => {
        el.innerHTML = '';
        el.style.display = 'none';
    });
}

// ==================== 浏览页面逻辑 ====================
function initBrowsePage() {
    console.log('初始化浏览页面');
    
    // 绑定事件
    const verifyBtn = document.getElementById('verifyBtn');
    const filterBtn = document.getElementById('filterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleAdminLogin);
    }
    
    if (filterBtn) {
        filterBtn.addEventListener('click', loadAndDisplayData);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFiltersAndLoad);
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    // 初始化图片查看器
    initImageViewer();
    
    console.log('浏览页面初始化完成');
}

async function handleAdminLogin() {
    const passwordInput = document.getElementById('password').value;
    const errorElement = document.getElementById('passwordError');
    
    if (!passwordInput) {
        errorElement.textContent = '请输入密码';
        return;
    }
    
    errorElement.textContent = '';
    
    const verifyBtn = document.getElementById('verifyBtn');
    verifyBtn.textContent = '验证中...';
    verifyBtn.disabled = true;
    
    try {
        const result = await window.verifyAdminPassword(passwordInput);
        
        if (result.success) {
            document.getElementById('passwordSection').style.display = 'none';
            document.getElementById('browseSection').style.display = 'block';
            loadAndDisplayData();
        } else {
            errorElement.textContent = result.message;
        }
    } catch (error) {
        console.error('登录异常:', error);
        errorElement.textContent = '验证过程出错，请重试';
    } finally {
        verifyBtn.textContent = '验证';
        verifyBtn.disabled = false;
    }
}

function getCurrentFilters() {
    return {
        name: document.getElementById('filterName')?.value || '',
        competition: document.getElementById('filterCompetition')?.value || '',
        level: document.getElementById('filterLevel')?.value || '',
        grade: document.getElementById('filterGrade')?.value || '',
        award: document.getElementById('filterAward')?.value || ''
    };
}

async function loadAndDisplayData() {
    const filters = getCurrentFilters();
    console.log('加载数据，筛选条件:', filters);
    
    const tableBody = document.querySelector('#awardTable tbody');
    const noDataMsg = document.getElementById('noDataMessage');
    const resultCountSpan = document.querySelector('#resultCount span');
    
    if (!tableBody) {
        console.error('未找到表格tbody');
        return;
    }
    
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:20px;">加载中...</td></tr>';
    
    const data = await window.fetchFilteredData(filters);
    
    tableBody.innerHTML = '';
    resultCountSpan.textContent = data.length;
    
    if (data.length === 0) {
        if (noDataMsg) noDataMsg.style.display = 'block';
        return;
    }
    
    if (noDataMsg) noDataMsg.style.display = 'none';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        let certificateCell = '无';
        
        if (item.certificate) {
            certificateCell = `<img src="${item.certificate}" alt="证书" class="certificate-img" onclick="viewImage('${item.certificate}')">`;
        }
        
        row.innerHTML = `
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.major)}</td>
            <td>${escapeHtml(item.grade)}</td>
            <td>${escapeHtml(item.competition)}</td>
            <td>${escapeHtml(item.level)}</td>
            <td>${escapeHtml(item.award)}</td>
            <td>${certificateCell}</td>
            <td>${item.submitTime}</td>
            <td><button class="action-btn" onclick="editRecord(${item.recordId})">修改</button></td>
            <td><button class="delete-btn" onclick="confirmDelete(${item.recordId})">删除</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function resetFiltersAndLoad() {
    ['filterName', 'filterCompetition', 'filterLevel', 'filterGrade', 'filterAward'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    loadAndDisplayData();
}

function exportToExcel() {
    alert('导出Excel功能正在开发中...');
}

function initImageViewer() {
    const imageViewer = document.getElementById('imageViewer');
    if (!imageViewer) return;
    
    const closeBtn = imageViewer.querySelector('.image-viewer-close');
    closeBtn.addEventListener('click', () => {
        imageViewer.style.display = 'none';
    });
    
    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            imageViewer.style.display = 'none';
        }
    });
}

function viewImage(src) {
    const imageViewer = document.getElementById('imageViewer');
    const viewerImage = document.getElementById('viewerImage');
    
    if (imageViewer && viewerImage) {
        viewerImage.src = src;
        imageViewer.style.display = 'flex';
    }
}

function editRecord(recordId) {
    alert('修改功能正在开发中，记录ID: ' + recordId);
}

function confirmDelete(recordId) {
    if (confirm('确定要删除这条记录吗？此操作不可撤销。')) {
        deleteRecord(recordId);
    }
}

async function deleteRecord(recordId) {
    const result = await window.deleteAwardRecord(recordId);
    alert(result.message);
    if (result.success) {
        loadAndDisplayData();
    }
}

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，页面标题:', document.title);
    
    if (document.title.includes('竞赛获奖情况统计')) {
        initSubmitPage();
    } else if (document.title.includes('竞赛获奖数据浏览')) {
        initBrowsePage();
    }
    
    console.log('页面初始化完成');
});

console.log('前端交互脚本加载完毕');
