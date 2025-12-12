// script.js - 前端页面交互逻辑
// 注意：此文件依赖于 supabase.js 中定义的全局函数。

document.addEventListener('DOMContentLoaded', function () {
  // 根据页面标题初始化不同功能
  if (document.title.includes('竞赛获奖情况统计')) {
    initSubmitPage();
  } else if (document.title.includes('竞赛获奖数据浏览')) {
    initBrowsePage();
  }
});

// ==================== 提交首页逻辑 ====================
function initSubmitPage() {
  const competitionModules = document.getElementById('competitionModules');
  const addModuleBtn = document.getElementById('addModule');
  const awardForm = document.getElementById('awardForm');
  const resetBtn = document.getElementById('resetBtn');
  const successModal = document.getElementById('successModal');
  const modalClose = successModal.querySelector('.close');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const browseDataBtn = document.getElementById('browseDataBtn');

  // 初始化：添加第一个竞赛模块
  addCompetitionModule();
// 添加调试信息
console.log('script.js 开始加载');

// 检查关键元素是否存在的函数
function checkPageElements() {
  console.log('检查页面元素...');
  
  if (document.title.includes('竞赛获奖情况统计')) {
    const importantElements = ['competitionModules', 'addModule', 'awardForm'];
    importantElements.forEach(id => {
      const el = document.getElementById(id);
      console.log(`元素 #${id}:`, el ? '存在' : '不存在');
    });
    
    // 测试竞赛模块功能
    const modulesContainer = document.getElementById('competitionModules');
    if (modulesContainer) {
      console.log('竞赛模块容器已找到，准备添加第一个模块');
      // 立即添加一个模块
      setTimeout(() => {
        addCompetitionModule();
        console.log('第一个竞赛模块已添加');
      }, 100);
    }
  }
}

// 修改DOMContentLoaded事件监听器
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM加载完成，当前页面:', document.title);
  
  // 先检查页面元素
  checkPageElements();
  
  // 再初始化页面功能
  if (document.title.includes('竞赛获奖情况统计')) {
    console.log('初始化提交页面...');
    initSubmitPage();
  } else if (document.title.includes('竞赛获奖数据浏览')) {
    console.log('初始化浏览页面...');
    initBrowsePage();
  }
  
  console.log('页面初始化完成');
});
  // 事件监听
  addModuleBtn.addEventListener('click', () => {
    addCompetitionModule();
    clearErrorSummary();
  });

  awardForm.addEventListener('submit', handleFormSubmit);
  resetBtn.addEventListener('click', handleFormReset);
  modalClose.addEventListener('click', () => successModal.style.display = 'none');
  resetFormBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
    handleFormReset();
  });
  browseDataBtn.addEventListener('click', () => {
    window.location.href = 'browse.html';
  });

  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === successModal) successModal.style.display = 'none';
  });
}

// 处理表单提交
async function handleFormSubmit(event) {
  event.preventDefault();
  console.log('开始处理表单提交...');

  if (!validateForm()) {
    console.log('表单验证未通过');
    return;
  }

  // 收集数据
  const studentName = document.getElementById('name').value.trim();
  const studentMajor = document.getElementById('major').value;
  const competitions = collectCompetitionData();

  // 显示加载状态（可选）
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '提交中...';
  submitBtn.disabled = true;

  try {
    // 调用supabase.js中的函数提交到云端
    const result = await window.submitAwardRecord(studentName, studentMajor, competitions);
    console.log('提交结果:', result);

    if (result.success) {
      // 显示成功模态框
      document.getElementById('successModal').style.display = 'block';
    } else {
      alert('错误：' + result.message);
    }
  } catch (error) {
    console.error('提交过程异常:', error);
    alert('提交过程中发生未知错误，请检查控制台。');
  } finally {
    // 恢复按钮状态
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// 收集所有竞赛模块的数据
function collectCompetitionData() {
  const modules = document.querySelectorAll('.competition-module');
  const competitions = [];

  modules.forEach((module, index) => {
    competitions.push({
      grade: document.getElementById(`grade-${index}`).value,
      competitionName: document.getElementById(`competition-${index}`).value.trim(),
      level: document.getElementById(`level-${index}`).value,
      award: document.getElementById(`award-${index}`).value,
      certificateUrl: null // 当前版本图片上传功能暂未实现
    });
  });

  return competitions;
}

// 表单验证（与原版基本相同，可复用）
function validateForm() {
  let isValid = true;
  const errors = [];

  // ... 这里是你原有的validateForm函数代码，无需改动 ...
  // 只需确保它检查姓名、专业和各竞赛模块的必填项，并在出错时调用 showErrorSummary(errors)

  // 示例验证（请替换为你的完整逻辑）
  const name = document.getElementById('name').value.trim();
  if (!name) {
    errors.push('请输入姓名');
    isValid = false;
  }
  // ... 其他验证 ...

  if (!isValid) {
    showErrorSummary(errors);
  }
  return isValid;
}

// 错误汇总显示（与原版相同）
function showErrorSummary(errorMessages) {
  // ... 这里是你原有的 showErrorSummary 函数代码 ...
}
function clearErrorSummary() {
  // ... 这里是你原有的 clearErrorSummary 函数代码 ...
}

// 重置表单
function handleFormReset() {
  document.getElementById('awardForm').reset();
  const modulesContainer = document.getElementById('competitionModules');
  modulesContainer.innerHTML = '';
  addCompetitionModule();
  clearErrorSummary();
  console.log('表单已重置');
}

// 添加/删除竞赛模块、图片预览等辅助函数（与你原版基本相同）
function addCompetitionModule() {
  // ... 这里是你原有的 addCompetitionModule 函数代码，无需改动 ...
}
function deleteModule(btn) {
  // ... 这里是你原有的 deleteModule 函数代码，无需改动 ...
}
function previewImage(input, moduleId) {
  // ... 这里是你原有的 previewImage 函数代码，无需改动 ...
}

// ==================== 数据浏览页逻辑 ====================
function initBrowsePage() {
  const verifyBtn = document.getElementById('verifyBtn');
  const filterBtn = document.getElementById('filterBtn');
  const resetFilterBtn = document.getElementById('resetFilterBtn');
  const exportExcelBtn = document.getElementById('exportExcelBtn');

  // 检查是否已通过验证（简单版，刷新页面需重新登录）
  // 实际应用中可将token存入sessionStorage

  verifyBtn.addEventListener('click', handleAdminLogin);
  filterBtn.addEventListener('click', loadAndDisplayData);
  resetFilterBtn.addEventListener('click', resetFiltersAndLoad);
  exportExcelBtn.addEventListener('click', exportToExcel);

  // 初始化图片查看器
  initImageViewer();
}

// 处理管理员登录
async function handleAdminLogin() {
  const passwordInput = document.getElementById('password').value;
  const errorElement = document.getElementById('passwordError');

  if (!passwordInput) {
    errorElement.textContent = '请输入密码';
    return;
  }

  const verifyBtn = document.getElementById('verifyBtn');
  verifyBtn.textContent = '验证中...';
  verifyBtn.disabled = true;

  const result = await window.verifyAdminPassword(passwordInput);

  if (result.success) {
    // 登录成功，显示数据浏览区
    document.getElementById('passwordSection').style.display = 'none';
    document.getElementById('browseSection').style.display = 'block';
    // 加载初始数据
    loadAndDisplayData();
  } else {
    errorElement.textContent = result.message;
  }

  verifyBtn.textContent = '验证';
  verifyBtn.disabled = false;
}

// 加载并显示数据
async function loadAndDisplayData() {
  const filters = getCurrentFilters();
  console.log('正在加载数据，筛选条件:', filters);

  const tableBody = document.querySelector('#awardTable tbody');
  tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">加载中...</td></tr>';

  const data = await window.fetchFilteredData(filters);
  displayDataInTable(data);
}

// 获取当前筛选条件
function getCurrentFilters() {
  return {
    name: document.getElementById('filterName').value,
    competition: document.getElementById('filterCompetition').value,
    level: document.getElementById('filterLevel').value,
    grade: document.getElementById('filterGrade').value,
    award: document.getElementById('filterAward').value
  };
}

// 将数据填充到表格
function displayDataInTable(data) {
  const tableBody = document.querySelector('#awardTable tbody');
  const noDataMsg = document.getElementById('noDataMessage');
  const resultCountSpan = document.querySelector('#resultCount span');

  tableBody.innerHTML = ''; // 清空表格
  resultCountSpan.textContent = data.length;

  if (data.length === 0) {
    noDataMsg.style.display = 'block';
    return;
  }
  noDataMsg.style.display = 'none';

  data.forEach(item => {
    const row = document.createElement('tr');
    // 处理证书图片显示
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

// 重置筛选条件并加载数据
function resetFiltersAndLoad() {
  document.getElementById('filterName').value = '';
  document.getElementById('filterCompetition').value = '';
  document.getElementById('filterLevel').value = '';
  document.getElementById('filterGrade').value = '';
  document.getElementById('filterAward').value = '';
  loadAndDisplayData();
}

// 导出Excel功能（需要引入SheetJS库）
function exportToExcel() {
  // ... 这里可以是你原有的 exportToExcel 函数代码 ...
  alert('导出功能需要额外配置，当前版本暂未启用。');
}

// 安全地转义HTML，防止XSS攻击
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 图片查看器函数
function initImageViewer() {
  // ... 这里是你原有的 initImageViewer 函数代码 ...
}
function viewImage(src) {
  // ... 这里是你原有的 viewImage 函数代码 ...
}

// 以下函数需要在supabase.js中实现对应功能后才能使用
function editRecord(recordId) {
  alert('修改功能正在开发中，记录ID: ' + recordId);
  // 未来实现：弹出模态框，加载当前记录数据，调用 window.updateAwardRecord
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
    loadAndDisplayData(); // 刷新列表
  }
}

console.log('前端交互脚本加载完毕。');
