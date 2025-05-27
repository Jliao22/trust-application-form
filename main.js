// 優化版 - 國際離岸信託申請表單主邏輯

// 全局變數
let currentStep = 1;
const totalSteps = 5;
let formData = {};
let currentLang = 'zh';
let contingentBeneficiaryCount = 0;

// DOM 元素
document.addEventListener('DOMContentLoaded', function() {
    // 初始化表單
    initForm();
    
    // 設置事件監聽器
    setupEventListeners();
    
    // 設置當前日期
    document.getElementById('submissionDate').valueAsDate = new Date();
});

// 初始化表單
function initForm() {
    // 更新進度條
    updateProgressBar();
    
    // 初始化語言
    updateLanguage(currentLang);
    
    // 初始化通訊地址區段
    toggleCorrespondenceAddress();
}

// 設置事件監聽器
function setupEventListeners() {
    // 語言切換
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentLang = this.getAttribute('data-lang');
            updateLanguage(currentLang);
            
            // 更新語言按鈕狀態
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 表單導航按鈕
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('submitBtn').addEventListener('click', submitForm);
    
    // 導出按鈕
    document.getElementById('exportBtn').addEventListener('click', exportFormData);
    
    // 通訊地址與住宅地址相同
    document.getElementById('sameAsResidential').addEventListener('change', toggleCorrespondenceAddress);
    
    // 添加次位受益人
    document.getElementById('addContingentBeneficiary').addEventListener('click', addContingentBeneficiary);
    
    // 進度條步驟點擊
    document.querySelectorAll('.progress-step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.getAttribute('data-step'));
            if (validateStepBeforeNavigation(currentStep, stepNum)) {
                goToStep(stepNum);
            }
        });
    });
}

// 更新語言
function updateLanguage(lang) {
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
        const key = 'data-' + lang;
        if (el.hasAttribute(key)) {
            const text = el.getAttribute(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        }
    });
}

// 更新進度條
function updateProgressBar() {
    // 更新進度條數據屬性
    document.querySelector('.progress-bar').setAttribute('data-progress', currentStep);
    
    // 更新步驟狀態
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // 更新按鈕顯示
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
    submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    
    // 導出按鈕只在最後一步顯示
    document.getElementById('exportBtn').style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
}

// 切換通訊地址區段
function toggleCorrespondenceAddress() {
    const sameAsResidential = document.getElementById('sameAsResidential').checked;
    const correspondenceAddressSection = document.getElementById('correspondenceAddressSection');
    
    correspondenceAddressSection.style.display = sameAsResidential ? 'none' : 'block';
    
    // 如果選中，則禁用通訊地址驗證
    const correspondenceAddress = document.getElementById('correspondenceAddress');
    correspondenceAddress.required = !sameAsResidential;
}

// 添加次位受益人
function addContingentBeneficiary() {
    contingentBeneficiaryCount++;
    
    // 獲取模板
    const template = document.getElementById('contingentBeneficiaryTemplate').innerHTML;
    
    // 替換索引
    const beneficiaryHtml = template.replace(/{index}/g, contingentBeneficiaryCount);
    
    // 創建元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = beneficiaryHtml;
    const beneficiaryElement = tempDiv.firstElementChild;
    
    // 添加到容器
    document.getElementById('contingentBeneficiariesContainer').appendChild(beneficiaryElement);
    
    // 添加刪除事件
    beneficiaryElement.querySelector('.remove-beneficiary').addEventListener('click', function() {
        beneficiaryElement.remove();
    });
    
    // 更新語言
    updateLanguage(currentLang);
    
    // 添加動畫效果
    beneficiaryElement.classList.add('pulse');
    setTimeout(() => {
        beneficiaryElement.classList.remove('pulse');
    }, 1500);
}

// 前一步
function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

// 下一步
function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            goToStep(currentStep + 1);
        }
    }
}

// 跳轉到指定步驟
function goToStep(step) {
    // 隱藏當前步驟
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    
    // 顯示目標步驟
    document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
    
    // 更新當前步驟
    currentStep = step;
    
    // 更新進度條
    updateProgressBar();
    
    // 如果是最後一步，生成表單預覽
    if (currentStep === totalSteps) {
        generateFormPreview();
    }
    
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 驗證步驟
function validateStep(step) {
    let isValid = true;
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    
    // 獲取當前步驟中的所有必填欄位
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    // 重置所有錯誤訊息
    currentStepElement.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    
    // 驗證每個必填欄位
    requiredFields.forEach(field => {
        // 跳過隱藏的欄位
        if (field.offsetParent === null && field.type !== 'hidden') {
            return;
        }
        
        let fieldValid = true;
        
        // 檢查是否為空
        if (field.value.trim() === '') {
            fieldValid = false;
        }
        
        // 電子郵件驗證
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                fieldValid = false;
            }
        }
        
        // 電話號碼驗證
        if (field.id === 'phoneNumber' && field.value) {
            const phoneRegex = /^[+]?[\d\s()-]{8,20}$/;
            if (!phoneRegex.test(field.value)) {
                fieldValid = false;
            }
        }
        
        // 單選按鈕組驗證
        if (field.type === 'radio') {
            const name = field.name;
            const radioGroup = document.querySelectorAll(`input[name="${name}"]:checked`);
            if (radioGroup.length === 0) {
                fieldValid = false;
                // 獲取父級 form-group
                const formGroup = field.closest('.form-group');
                formGroup.classList.add('error');
            }
            return; // 跳過後續處理，因為已經處理了整個組
        }
        
        // 複選框驗證
        if (field.type === 'checkbox' && !field.checked) {
            fieldValid = false;
        }
        
        // 數字範圍驗證
        if (field.type === 'number') {
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);
            const value = parseFloat(field.value);
            
            if (isNaN(value) || value < min || value > max) {
                fieldValid = false;
            }
        }
        
        // 如果無效，添加錯誤類
        if (!fieldValid) {
            isValid = false;
            const formGroup = field.closest('.form-group');
            formGroup.classList.add('error');
        }
    });
    
    // 特殊驗證：受益人比例總和
    if (step === 4) {
        // 檢查基本受益人和次位受益人的比例總和是否為100%
        const primaryPercentage = parseFloat(document.getElementById('primaryBeneficiaryPercentage').value) || 0;
        let contingentTotal = 0;
        
        document.querySelectorAll('.contingent-beneficiary').forEach(beneficiary => {
            const percentageInput = beneficiary.querySelector('input[type="number"]');
            contingentTotal += parseFloat(percentageInput.value) || 0;
        });
        
        const total = primaryPercentage + contingentTotal;
        
        if (total !== 100) {
            isValid = false;
            alert(currentLang === 'zh' ? 
                  '所有受益人的比例份額總和必須為100%。目前總和為: ' + total + '%' : 
                  'The total percentage of all beneficiaries must be 100%. Current total: ' + total + '%');
        }
    }
    
    return isValid;
}

// 在導航到其他步驟前驗證當前步驟
function validateStepBeforeNavigation(currentStep, targetStep) {
    // 如果是向前導航，需要驗證當前步驟
    if (targetStep > currentStep) {
        // 驗證從當前步驟到目標步驟之間的所有步驟
        for (let i = currentStep; i < targetStep; i++) {
            if (!validateStep(i)) {
                return false;
            }
        }
    }
    return true;
}

// 生成表單預覽
function generateFormPreview() {
    const previewContainer = document.getElementById('formPreview');
    previewContainer.innerHTML = '';
    
    // 收集表單數據
    collectFormData();
    
    // 基本資料
    const basicInfoSection = document.createElement('div');
    basicInfoSection.className = 'review-item';
    basicInfoSection.innerHTML = `
        <h5>${currentLang === 'zh' ? '基本資料' : 'Basic Information'}</h5>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '英文姓名' : 'English Name'}</label>
            <span>${formData.englishName || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '中文姓名' : 'Chinese Name'}</label>
            <span>${formData.chineseName || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '身份證號碼' : 'ID Number'}</label>
            <span>${formData.idNumber || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '護照號碼' : 'Passport Number'}</label>
            <span>${formData.passportNumber || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '出生日期' : 'Date of Birth'}</label>
            <span>${formData.dateOfBirth || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '國籍' : 'Nationality'}</label>
            <span>${getNationalityText(formData.nationality) || '-'}</span>
        </div>
    `;
    previewContainer.appendChild(basicInfoSection);
    
    // 聯絡資訊
    const contactSection = document.createElement('div');
    contactSection.className = 'review-item';
    contactSection.innerHTML = `
        <h5>${currentLang === 'zh' ? '聯絡資訊' : 'Contact Information'}</h5>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '住宅地址' : 'Residential Address'}</label>
            <span>${formData.residentialAddress || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '通訊地址' : 'Correspondence Address'}</label>
            <span>${formData.sameAsResidential ? (currentLang === 'zh' ? '同住宅地址' : 'Same as residential address') : (formData.correspondenceAddress || '-')}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '聯絡電話' : 'Phone Number'}</label>
            <span>${formData.phoneNumber || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '電郵地址' : 'Email Address'}</label>
            <span>${formData.email || '-'}</span>
        </div>
    `;
    previewContainer.appendChild(contactSection);
    
    // 銀行資料
    const bankSection = document.createElement('div');
    bankSection.className = 'review-item';
    bankSection.innerHTML = `
        <h5>${currentLang === 'zh' ? '銀行資料' : 'Bank Information'}</h5>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '銀行名稱' : 'Bank Name'}</label>
            <span>${formData.bankName || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '銀行帳戶名稱' : 'Bank Account Name'}</label>
            <span>${formData.bankAccountName || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '銀行帳戶號碼' : 'Bank Account Number'}</label>
            <span>${formData.bankAccountNumber || '-'}</span>
        </div>
    `;
    previewContainer.appendChild(bankSection);
    
    // 資金來源
    const fundSection = document.createElement('div');
    fundSection.className = 'review-item';
    fundSection.innerHTML = `
        <h5>${currentLang === 'zh' ? '資金來源' : 'Source of Funds'}</h5>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '就業狀況' : 'Employment Status'}</label>
            <span>${getEmploymentText(formData.employment) || '-'}</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '資產類型' : 'Asset Types'}</label>
            <span>${getAssetsText(formData.assets) || '-'}</span>
        </div>
    `;
    previewContainer.appendChild(fundSection);
    
    // 受益人資訊
    const beneficiarySection = document.createElement('div');
    beneficiarySection.className = 'review-item';
    beneficiarySection.innerHTML = `
        <h5>${currentLang === 'zh' ? '受益人資訊' : 'Beneficiary Information'}</h5>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '在生期間受益人' : 'Lifetime Beneficiary'}</label>
            <span>${formData.lifetimeBeneficiaryEnglishName || '-'} (${formData.lifetimeBeneficiaryPercentage || 0}%)</span>
        </div>
        <div class="review-field">
            <label>${currentLang === 'zh' ? '基本受益人' : 'Primary Beneficiary'}</label>
            <span>${formData.primaryBeneficiaryEnglishName || '-'} (${formData.primaryBeneficiaryPercentage || 0}%)</span>
        </div>
    `;
    
    // 添加次位受益人
    if (formData.contingentBeneficiaries && formData.contingentBeneficiaries.length > 0) {
        formData.contingentBeneficiaries.forEach((beneficiary, index) => {
            const contingentField = document.createElement('div');
            contingentField.className = 'review-field';
            contingentField.innerHTML = `
                <label>${currentLang === 'zh' ? '次位受益人 ' : 'Contingent Beneficiary '} ${index + 1}</label>
                <span>${beneficiary.englishName || '-'} (${beneficiary.percentage || 0}%)</span>
            `;
            beneficiarySection.appendChild(contingentField);
        });
    }
    
    previewContainer.appendChild(beneficiarySection);
}

// 獲取國籍文本
function getNationalityText(code) {
    if (!code) return '';
    
    const nationalities = {
        'HK': currentLang === 'zh' ? '香港' : 'Hong Kong',
        'CN': currentLang === 'zh' ? '中國' : 'China',
        'TW': currentLang === 'zh' ? '台灣' : 'Taiwan',
        'SG': currentLang === 'zh' ? '新加坡' : 'Singapore',
        'US': currentLang === 'zh' ? '美國' : 'United States',
        'UK': currentLang === 'zh' ? '英國' : 'United Kingdom',
        'OTHER': currentLang === 'zh' ? '其他' : 'Other'
    };
    
    return nationalities[code] || code;
}

// 獲取就業狀況文本
function getEmploymentText(status) {
    if (!status) return '';
    
    const statuses = {
        'employed': currentLang === 'zh' ? '受僱' : 'Employed',
        'selfEmployed': currentLang === 'zh' ? '自僱' : 'Self-employed',
        'retired': currentLang === 'zh' ? '退休' : 'Retired'
    };
    
    return statuses[status] || status;
}

// 獲取資產文本
function getAssetsText(assets) {
    if (!assets || assets.length === 0) return '';
    
    const assetTypes = {
        'cash': currentLang === 'zh' ? '現金' : 'Cash',
        'savings': currentLang === 'zh' ? '儲蓄' : 'Savings',
        'securities': currentLang === 'zh' ? '證券' : 'Securities',
        'foreignCurrency': currentLang === 'zh' ? '外幣' : 'Foreign Currency',
        'futures': currentLang === 'zh' ? '期貨' : 'Futures',
        'funds': currentLang === 'zh' ? '基金' : 'Funds',
        'commodities': currentLang === 'zh' ? '商品' : 'Commodities',
        'realEstate': currentLang === 'zh' ? '房地產' : 'Real Estate',
        'insurance': currentLang === 'zh' ? '保單' : 'Insurance Policy'
    };
    
    return assets.map(asset => assetTypes[asset] || asset).join(', ');
}

// 收集表單數據
function collectFormData() {
    formData = {};
    
    // 獲取所有輸入欄位
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // 跳過按鈕
        if (input.type === 'button' || input.type === 'submit') {
            return;
        }
        
        // 處理複選框
        if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
            
            // 處理資產複選框
            if (input.name === 'assets' && input.checked) {
                if (!formData.assets) {
                    formData.assets = [];
                }
                formData.assets.push(input.value);
            }
            
            if (input.name === 'nonLiquidAssets' && input.checked) {
                if (!formData.assets) {
                    formData.assets = [];
                }
                formData.assets.push(input.value);
            }
            
            return;
        }
        
        // 處理單選按鈕
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
            return;
        }
        
        // 處理其他輸入欄位
        if (input.name && input.name !== '') {
            formData[input.name] = input.value;
        }
    });
    
    // 處理次位受益人
    formData.contingentBeneficiaries = [];
    document.querySelectorAll('.contingent-beneficiary').forEach((beneficiary, index) => {
        const beneficiaryData = {
            englishName: beneficiary.querySelector(`input[id^="contingentBeneficiaryEnglishName_"]`).value,
            chineseName: beneficiary.querySelector(`input[id^="contingentBeneficiaryChineseName_"]`).value,
            idNumber: beneficiary.querySelector(`input[id^="contingentBeneficiaryIdNumber_"]`).value,
            relationship: beneficiary.querySelector(`input[id^="contingentBeneficiaryRelationship_"]`).value,
            percentage: beneficiary.querySelector(`input[id^="contingentBeneficiaryPercentage_"]`).value
        };
        
        formData.contingentBeneficiaries.push(beneficiaryData);
    });
    
    return formData;
}

// 提交表單
function submitForm(e) {
    e.preventDefault();
    
    if (validateStep(totalSteps)) {
        // 收集表單數據
        collectFormData();
        
        // 保存到本地存儲
        localStorage.setItem('trustFormData', JSON.stringify(formData));
        
        // 隱藏表單
        document.querySelector('.trust-form').style.display = 'none';
        
        // 顯示成功訊息
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h3>${currentLang === 'zh' ? '申請提交成功！' : 'Application Submitted Successfully!'}</h3>
            <p>${currentLang === 'zh' ? '感謝您提交國際離岸信託申請。我們已收到您的申請，並將盡快處理。' : 'Thank you for submitting your International Off-shore Trust application. We have received your application and will process it as soon as possible.'}</p>
            <div class="success-actions">
                <button type="button" class="btn btn-primary" id="downloadDataBtn">
                    <i class="fas fa-download"></i>
                    <span>${currentLang === 'zh' ? '下載申請資料' : 'Download Application Data'}</span>
                </button>
                <button type="button" class="btn btn-secondary" id="newApplicationBtn">
                    <i class="fas fa-plus-circle"></i>
                    <span>${currentLang === 'zh' ? '新的申請' : 'New Application'}</span>
                </button>
            </div>
        `;
        
        document.querySelector('.container').appendChild(successMessage);
        
        // 添加下載按鈕事件
        document.getElementById('downloadDataBtn').addEventListener('click', exportFormData);
        
        // 添加新申請按鈕事件
        document.getElementById('newApplicationBtn').addEventListener('click', function() {
            location.reload();
        });
    }
}

// 導出表單數據
function exportFormData() {
    // 收集表單數據
    collectFormData();
    
    // 保存到本地存儲
    localStorage.setItem('trustFormData', JSON.stringify(formData));
    
    // 調用導出函數（在export.js中定義）
    if (typeof exportToExcel === 'function') {
        exportToExcel();
    } else {
        // 如果導出函數不可用，創建一個簡單的JSON下載
        const dataStr = JSON.stringify(formData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'trust_application_data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}
