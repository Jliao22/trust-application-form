// Global variables
let currentStep = 1;
const totalSteps = 5;
let formData = {};
let currentLang = 'zh';

// Initialize EmailJS (需要您的 EmailJS 服務配置)
// emailjs.init("YOUR_USER_ID");

// DOM Elements
const form = document.getElementById('trustForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressSteps = document.querySelectorAll('.progress-step');
const formSteps = document.querySelectorAll('.form-step');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setSubmissionDate();
});

// Initialize form
function initializeForm() {
    showStep(currentStep);
    updateProgressBar();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', () => navigateStep(-1));
    nextBtn.addEventListener('click', () => navigateStep(1));
    
    // Form submission
    form.addEventListener('submit', handleSubmit);
    
    // Language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setLanguage(this.getAttribute('data-lang'));
        });
    });
    
    // Same address checkbox
    const sameAddressCheckbox = document.getElementById('sameAddress');
    if (sameAddressCheckbox) {
        sameAddressCheckbox.addEventListener('change', handleSameAddress);
    }
    
    // Employment status radio buttons
    const employmentRadios = document.querySelectorAll('input[name="employmentStatus"]');
    employmentRadios.forEach(radio => {
        radio.addEventListener('change', handleEmploymentStatus);
    });
    
    // Add beneficiary button
    const addBeneficiaryBtn = document.getElementById('addDeathBeneficiary');
    if (addBeneficiaryBtn) {
        addBeneficiaryBtn.addEventListener('click', addDeathBeneficiary);
    }
}

// Show specific step
function showStep(step) {
    formSteps.forEach(s => s.classList.remove('active'));
    const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // If it's the review step, generate review content
    if (step === 5) {
        generateReviewContent();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update progress bar
function updateProgressBar() {
    progressSteps.forEach((step, index) => {
        if (index + 1 < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// Update navigation buttons
function updateNavigationButtons() {
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Navigate between steps
function navigateStep(direction) {
    // Validate current step before moving forward
    if (direction > 0 && !validateCurrentStep()) {
        return;
    }
    
    // Save current step data
    saveStepData();
    
    // Update step
    currentStep += direction;
    
    // Ensure step is within bounds
    if (currentStep < 1) currentStep = 1;
    if (currentStep > totalSteps) currentStep = totalSteps;
    
    // Show new step
    showStep(currentStep);
    updateProgressBar();
}

// Validate current step
function validateCurrentStep() {
    const currentFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentFormStep.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('請填寫所有必填欄位', 'error');
    }
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    const formGroup = field.closest('.form-group');
    let isValid = true;
    
    // Remove previous error state
    formGroup?.classList.remove('has-error');
    
    // Check if field is empty
    if (!field.value.trim()) {
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(field.value)) {
            isValid = false;
        }
    }
    
    // Add error class if invalid
    if (!isValid && formGroup) {
        formGroup.classList.add('has-error');
    }
    
    return isValid;
}

// Save current step data
function saveStepData() {
    const currentFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentFormStep.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
}

// Set language
function setLanguage(lang) {
    currentLang = lang;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Update all elements with language attributes
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
}

// Handle same address checkbox
function handleSameAddress(e) {
    const correspondenceSection = document.getElementById('correspondenceAddressSection');
    const residentialAddress = document.getElementById('residentialAddress').value;
    const correspondenceAddress = document.getElementById('correspondenceAddress');
    
    if (e.target.checked) {
        correspondenceSection.style.display = 'none';
        correspondenceAddress.value = residentialAddress;
        correspondenceAddress.removeAttribute('required');
    } else {
        correspondenceSection.style.display = 'block';
        correspondenceAddress.value = '';
        correspondenceAddress.setAttribute('required', 'required');
    }
}

// Handle employment status change
function handleEmploymentStatus(e) {
    const employmentDetails = document.getElementById('employmentDetails');
    const isRetired = e.target.value === 'retired';
    
    if (isRetired) {
        employmentDetails.style.display = 'none';
        // Remove required from employment fields
        ['employer', 'yearsOfEmployment', 'position', 'annualIncome'].forEach(id => {
            const field = document.getElementById(id);
            if (field) field.removeAttribute('required');
        });
    } else {
        employmentDetails.style.display = 'block';
        // Add required to employment fields
        ['employer', 'yearsOfEmployment', 'position', 'annualIncome'].forEach(id => {
            const field = document.getElementById(id);
            if (field) field.setAttribute('required', 'required');
        });
    }
}

// Add death beneficiary
let deathBeneficiaryCount = 1;
function addDeathBeneficiary() {
    deathBeneficiaryCount++;
    const container = document.getElementById('deathBeneficiariesContainer');
    
    const newBeneficiary = document.createElement('div');
    newBeneficiary.className = 'death-beneficiary-item';
    newBeneficiary.innerHTML = `
        <h5 data-zh="次位受益人 ${deathBeneficiaryCount}" data-en="Contingent Beneficiary ${deathBeneficiaryCount}">
            次位受益人 ${deathBeneficiaryCount}
        </h5>
        
        <div class="form-row">
            <div class="form-group">
                <label for="deathBeneficiaryEnglishName${deathBeneficiaryCount}">
                    <span data-zh="英文姓名" data-en="English Name">英文姓名</span>
                    <span class="required">*</span>
                </label>
                <input type="text" id="deathBeneficiaryEnglishName${deathBeneficiaryCount}" 
                       name="deathBeneficiaryEnglishName${deathBeneficiaryCount}" required>
            </div>
            <div class="form-group">
                <label for="deathBeneficiaryChineseName${deathBeneficiaryCount}">
                    <span data-zh="中文姓名" data-en="Chinese Name">中文姓名</span>
                </label>
                <input type="text" id="deathBeneficiaryChineseName${deathBeneficiaryCount}" 
                       name="deathBeneficiaryChineseName${deathBeneficiaryCount}">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="deathBeneficiaryID${deathBeneficiaryCount}">
                    <span data-zh="身份證號碼" data-en="ID Number">身份證號碼</span>
                    <span class="required">*</span>
                </label>
                <input type="text" id="deathBeneficiaryID${deathBeneficiaryCount}" 
                       name="deathBeneficiaryID${deathBeneficiaryCount}" required>
            </div>
            <div class="form-group">
                <label for="deathBeneficiaryRelationship${deathBeneficiaryCount}">
                    <span data-zh="與委託人關係" data-en="Relationship with Settlor">與委託人關係</span>
                    <span class="required">*</span>
                </label>
                <input type="text" id="deathBeneficiaryRelationship${deathBeneficiaryCount}" 
                       name="deathBeneficiaryRelationship${deathBeneficiaryCount}" required>
            </div>
        </div>

        <div class="form-group">
            <label for="deathBeneficiaryPercentage${deathBeneficiaryCount}">
                <span data-zh="受益人比例份額 (%)" data-en="Share of Beneficiary (%)">受益人比例份額 (%)</span>
                <span class="required">*</span>
            </label>
            <input type="number" id="deathBeneficiaryPercentage${deathBeneficiaryCount}" 
                   name="deathBeneficiaryPercentage${deathBeneficiaryCount}" min="0" max="100" required>
        </div>
        
        <button type="button" class="btn btn-secondary" onclick="removeBeneficiary(this)">
            <span data-zh="移除" data-en="Remove">移除</span>
        </button>
    `;
    
    container.appendChild(newBeneficiary);
    
    // Update language for new elements
    if (currentLang !== 'zh') {
        newBeneficiary.querySelectorAll('[data-zh][data-en]').forEach(element => {
            element.textContent = element.getAttribute(`data-${currentLang}`);
        });
    }
}

// Remove beneficiary
function removeBeneficiary(button) {
    button.closest('.death-beneficiary-item').remove();
}

// Generate review content
function generateReviewContent() {
    saveStepData(); // Save current data
    
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = '';
    
    // Section 1: Basic Information
    const basicInfo = `
        <div class="review-item">
            <h5>${currentLang === 'zh' ? '基本資料' : 'Basic Information'}</h5>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '顧問編號' : 'Consultant Code'}:</label>
                <span>${formData.consultantCode || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '顧問姓名' : 'Consultant Name'}:</label>
                <span>${formData.consultantName || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '英文姓名' : 'English Name'}:</label>
                <span>${formData.englishName || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '中文姓名' : 'Chinese Name'}:</label>
                <span>${formData.chineseName || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '身份證號碼' : 'ID Number'}:</label>
                <span>${formData.idNumber || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '護照號碼' : 'Passport Number'}:</label>
                <span>${formData.passportNumber || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '出生日期' : 'Date of Birth'}:</label>
                <span>${formData.dateOfBirth || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '國籍' : 'Nationality'}:</label>
                <span>${getSelectText('nationality') || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '出生地' : 'Place of Birth'}:</label>
                <span>${formData.placeOfBirth || '-'}</span>
            </div>
        </div>
    `;
    
    // Section 2: Contact Information
    const contactInfo = `
        <div class="review-item">
            <h5>${currentLang === 'zh' ? '聯絡資訊' : 'Contact Information'}</h5>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '住宅地址' : 'Residential Address'}:</label>
                <span>${formData.residentialAddress || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '城市' : 'City'}:</label>
                <span>${formData.city || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '省/州' : 'Province/State'}:</label>
                <span>${formData.province || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '郵政編碼' : 'Postal Code'}:</label>
                <span>${formData.postalCode || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '國家' : 'Country'}:</label>
                <span>${getSelectText('country') || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '聯絡電話' : 'Contact Number'}:</label>
                <span>${formData.contactNumber || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '電郵地址' : 'Email Address'}:</label>
                <span>${formData.emailAddress || '-'}</span>
            </div>
        </div>
    `;
    
    // Section 3: Bank Information
    const bankInfo = `
        <div class="review-item">
            <h5>${currentLang === 'zh' ? '銀行資料' : 'Bank Information'}</h5>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '銀行名稱' : 'Bank Name'}:</label>
                <span>${formData.bankName || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? 'SWIFT代碼' : 'SWIFT Code'}:</label>
                <span>${formData.swiftCode || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '帳戶名稱' : 'Account Name'}:</label>
                <span>${formData.accountName || '-'}</span>
            </div>
            <div class="review-field">
                <label>${currentLang === 'zh' ? '帳戶號碼' : 'Account Number'}:</label>
                <span>${formData.accountNumber || '-'}</span>
            </div>
        </div>
    `;
    
    reviewContent.innerHTML = basicInfo + contactInfo + bankInfo;
}

// Get select field text
function getSelectText(fieldName) {
    const select = document.getElementById(fieldName);
    if (select && select.selectedIndex > 0) {
        return select.options[select.selectedIndex].text;
    }
    return '';
}

// Set submission date
function setSubmissionDate() {
    const today = new Date().toISOString().split('T')[0];
    const submissionDate = document.getElementById('submissionDate');
    if (submissionDate) {
        submissionDate.value = today;
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Final validation
    if (!validateCurrentStep()) {
        return;
    }
    
    // Check if terms are agreed
    if (!document.getElementById('agreeTerms').checked || 
        !document.getElementById('agreeDataCollection').checked) {
        showNotification('請同意所有條款', 'error');
        return;
    }
    
    // Save final data
    saveStepData();
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Send email using EmailJS or your preferred method
        await sendFormData();
        
        // Show success message
        form.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        // Store data for export
        localStorage.setItem('trustFormData', JSON.stringify(formData));
        
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('提交失敗，請稍後再試', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Send form data
async function sendFormData() {
    // Using EmailJS (需要配置)
    /*
    const templateParams = {
        to_email: 'admin@timelesstrust.com',
        from_name: formData.englishName,
        from_email: formData.emailAddress,
        message: JSON.stringify(formData, null, 2)
    };
    
    return emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
    */
    
    // Using Formspree (替代方案)
    const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
    
    return fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
