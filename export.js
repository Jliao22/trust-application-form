// 優化版 - 國際離岸信託申請表單導出功能

// 導出到Excel功能
function exportToExcel() {
    // 獲取存儲的表單數據
    const storedData = localStorage.getItem('trustFormData');
    if (!storedData) {
        alert(currentLang === 'zh' ? '沒有找到表單數據' : 'No form data found');
        return;
    }
    
    const formData = JSON.parse(storedData);
    
    // 創建工作表數據
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 添加標題行
    csvContent += "欄位,值\n";
    
    // 基本資料
    csvContent += "=== " + (currentLang === 'zh' ? '基本資料' : 'Basic Information') + " ===\n";
    csvContent += addCsvRow('顧問編號 / Consultant Code', formData.consultantCode);
    csvContent += addCsvRow('顧問姓名 / Consultant Name', formData.consultantName);
    csvContent += addCsvRow('英文姓名 / English Name', formData.englishName);
    csvContent += addCsvRow('中文姓名 / Chinese Name', formData.chineseName);
    csvContent += addCsvRow('身份證號碼 / ID Number', formData.idNumber);
    csvContent += addCsvRow('護照號碼 / Passport Number', formData.passportNumber);
    csvContent += addCsvRow('出生日期 / Date of Birth', formData.dateOfBirth);
    csvContent += addCsvRow('國籍 / Nationality', getNationalityText(formData.nationality));
    csvContent += addCsvRow('出生地 / Place of Birth', formData.placeOfBirth);
    
    // 聯絡資訊
    csvContent += "=== " + (currentLang === 'zh' ? '聯絡資訊' : 'Contact Information') + " ===\n";
    csvContent += addCsvRow('住宅地址 / Residential Address', formData.residentialAddress);
    csvContent += addCsvRow('城市 / City', formData.city);
    csvContent += addCsvRow('省/州 / Province/State', formData.province);
    csvContent += addCsvRow('郵政編碼 / Postal Code', formData.postalCode);
    csvContent += addCsvRow('國家 / Country', getNationalityText(formData.country));
    
    if (formData.sameAsResidential) {
        csvContent += addCsvRow('通訊地址 / Correspondence Address', currentLang === 'zh' ? '同住宅地址' : 'Same as residential address');
    } else {
        csvContent += addCsvRow('通訊地址 / Correspondence Address', formData.correspondenceAddress);
    }
    
    csvContent += addCsvRow('聯絡電話 / Phone Number', formData.phoneNumber);
    csvContent += addCsvRow('電郵地址 / Email Address', formData.email);
    
    // 銀行資料
    csvContent += "=== " + (currentLang === 'zh' ? '銀行資料' : 'Bank Information') + " ===\n";
    csvContent += addCsvRow('銀行名稱 / Bank Name', formData.bankName);
    csvContent += addCsvRow('銀行國際編碼 / Bank SWIFT Code', formData.bankSwiftCode);
    csvContent += addCsvRow('銀行帳戶名稱 / Bank Account Name', formData.bankAccountName);
    csvContent += addCsvRow('銀行帳戶號碼 / Bank Account Number', formData.bankAccountNumber);
    
    // 資金來源
    csvContent += "=== " + (currentLang === 'zh' ? '資金來源' : 'Source of Funds') + " ===\n";
    csvContent += addCsvRow('就業狀況 / Employment Status', getEmploymentText(formData.employment));
    
    // 資產
    if (formData.assets && formData.assets.length > 0) {
        csvContent += addCsvRow('資產類型 / Asset Types', getAssetsText(formData.assets));
    }
    
    csvContent += addCsvRow('其他資產 / Other Assets', formData.assetOther);
    csvContent += addCsvRow('流動資產總值 / Liquid Asset Value', formData.liquidAssetValue);
    csvContent += addCsvRow('非流動資產總值 / Non-liquid Asset Value', formData.nonLiquidAssetValue);
    
    // 受益人資訊
    csvContent += "=== " + (currentLang === 'zh' ? '受益人資訊' : 'Beneficiary Information') + " ===\n";
    
    // 在生期間受益人
    csvContent += "--- " + (currentLang === 'zh' ? '在生期間受益人' : 'Lifetime Beneficiary') + " ---\n";
    csvContent += addCsvRow('英文姓名 / English Name', formData.lifetimeBeneficiaryEnglishName);
    csvContent += addCsvRow('中文姓名 / Chinese Name', formData.lifetimeBeneficiaryChineseName);
    csvContent += addCsvRow('身份證號碼 / ID Number', formData.lifetimeBeneficiaryIdNumber);
    csvContent += addCsvRow('護照號碼 / Passport Number', formData.lifetimeBeneficiaryPassportNumber);
    csvContent += addCsvRow('出生日期 / Date of Birth', formData.lifetimeBeneficiaryDateOfBirth);
    csvContent += addCsvRow('國籍 / Nationality', getNationalityText(formData.lifetimeBeneficiaryNationality));
    csvContent += addCsvRow('與委託人關係 / Relationship', formData.lifetimeBeneficiaryRelationship);
    csvContent += addCsvRow('受益人比例份額 / Percentage', formData.lifetimeBeneficiaryPercentage + '%');
    
    // 基本受益人
    csvContent += "--- " + (currentLang === 'zh' ? '基本受益人' : 'Primary Beneficiary') + " ---\n";
    csvContent += addCsvRow('英文姓名 / English Name', formData.primaryBeneficiaryEnglishName);
    csvContent += addCsvRow('中文姓名 / Chinese Name', formData.primaryBeneficiaryChineseName);
    csvContent += addCsvRow('身份證號碼 / ID Number', formData.primaryBeneficiaryIdNumber);
    csvContent += addCsvRow('與委託人關係 / Relationship', formData.primaryBeneficiaryRelationship);
    csvContent += addCsvRow('受益人比例份額 / Percentage', formData.primaryBeneficiaryPercentage + '%');
    
    // 次位受益人
    if (formData.contingentBeneficiaries && formData.contingentBeneficiaries.length > 0) {
        formData.contingentBeneficiaries.forEach((beneficiary, index) => {
            csvContent += "--- " + (currentLang === 'zh' ? '次位受益人 ' : 'Contingent Beneficiary ') + (index + 1) + " ---\n";
            csvContent += addCsvRow('英文姓名 / English Name', beneficiary.englishName);
            csvContent += addCsvRow('中文姓名 / Chinese Name', beneficiary.chineseName);
            csvContent += addCsvRow('身份證號碼 / ID Number', beneficiary.idNumber);
            csvContent += addCsvRow('與委託人關係 / Relationship', beneficiary.relationship);
            csvContent += addCsvRow('受益人比例份額 / Percentage', beneficiary.percentage + '%');
        });
    }
    
    // 提交資訊
    csvContent += "=== " + (currentLang === 'zh' ? '提交資訊' : 'Submission Information') + " ===\n";
    csvContent += addCsvRow('提交日期 / Submission Date', formData.submissionDate);
    csvContent += addCsvRow('同意條款 / Agree to Terms', formData.agreeTerms ? '是 / Yes' : '否 / No');
    csvContent += addCsvRow('同意個人資料收集 / Agree to Privacy', formData.agreePrivacy ? '是 / Yes' : '否 / No');
    
    // 創建下載連結
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trust_application_" + new Date().toISOString().slice(0, 10) + ".csv");
    document.body.appendChild(link);
    
    // 觸發下載
    link.click();
    
    // 清理
    document.body.removeChild(link);
}

// 輔助函數：添加CSV行
function addCsvRow(field, value) {
    return '"' + field + '","' + (value || '') + '"\n';
}

// 輔助函數：獲取國籍文本
function getNationalityText(code) {
    if (!code) return '';
    
    const nationalities = {
        'HK': '香港 / Hong Kong',
        'CN': '中國 / China',
        'TW': '台灣 / Taiwan',
        'SG': '新加坡 / Singapore',
        'US': '美國 / United States',
        'UK': '英國 / United Kingdom',
        'OTHER': '其他 / Other'
    };
    
    return nationalities[code] || code;
}

// 輔助函數：獲取就業狀況文本
function getEmploymentText(status) {
    if (!status) return '';
    
    const statuses = {
        'employed': '受僱 / Employed',
        'selfEmployed': '自僱 / Self-employed',
        'retired': '退休 / Retired'
    };
    
    return statuses[status] || status;
}

// 輔助函數：獲取資產文本
function getAssetsText(assets) {
    if (!assets || assets.length === 0) return '';
    
    const assetTypes = {
        'cash': '現金 / Cash',
        'savings': '儲蓄 / Savings',
        'securities': '證券 / Securities',
        'foreignCurrency': '外幣 / Foreign Currency',
        'futures': '期貨 / Futures',
        'funds': '基金 / Funds',
        'commodities': '商品 / Commodities',
        'realEstate': '房地產 / Real Estate',
        'insurance': '保單 / Insurance Policy'
    };
    
    return assets.map(asset => assetTypes[asset] || asset).join(', ');
}
