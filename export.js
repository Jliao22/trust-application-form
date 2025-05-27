// Export to Excel function
function exportToExcel() {
    // Get stored form data
    const storedData = localStorage.getItem('trustFormData');
    if (!storedData) {
        alert('沒有找到表單數據');
        return;
    }
    
    const formData = JSON.parse(storedData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for main sheet
    const mainData = [
        ['國際離岸信託申請表單 / International Off-shore Trust Application'],
        [''],
        ['基本資料 / Basic Information'],
        ['顧問編號 / Consultant Code', formData.consultantCode || ''],
        ['顧問姓名 / Consultant Name', formData.consultantName || ''],
        ['英文姓名 / English Name', formData.englishName || ''],
        ['中文姓名 / Chinese Name', formData.chineseName || ''],
        ['身份證號碼 / ID Number', formData.idNumber || ''],
        ['護照號碼 / Passport Number', formData.passportNumber || ''],
        ['出生日期 / Date of Birth', formData.dateOfBirth || ''],
        ['國籍 / Nationality', formData.nationality || ''],
        ['出生地 / Place of Birth', formData.placeOfBirth || ''],
        [''],
        ['聯絡資訊 / Contact Information'],
        ['住宅地址 / Residential Address', formData.residentialAddress || ''],
        ['城市 / City', formData.city || ''],
        ['省/州 / Province/State', formData.province || ''],
        ['郵政編碼 / Postal Code', formData.postalCode || ''],
        ['國家 / Country', formData.country || ''],
        ['通訊地址與住宅地址相同 / Same as Residential', formData.sameAddress ? '是/Yes' : '否/No'],
        ['通訊地址 / Correspondence Address', formData.correspondenceAddress || ''],
        ['聯絡電話 / Contact Number', formData.contactNumber || ''],
        ['電郵地址 / Email Address', formData.emailAddress || ''],
        [''],
        ['銀行資料 / Bank Information'],
        ['銀行名稱 / Bank Name', formData.bankName || ''],
        ['SWIFT代碼 / SWIFT Code', formData.swiftCode || ''],
        ['帳戶名稱 / Account Name', formData.accountName || ''],
        ['帳戶號碼 / Account Number', formData.accountNumber || ''],
        [''],
        ['資金來源 / Source of Funds'],
        ['就業狀態 / Employment Status', formData.employmentStatus || ''],
        ['僱主 / Employer', formData.employer || ''],
        ['就業年份 / Years of Employment', formData.yearsOfEmployment || ''],
        ['職位 / Position', formData.position || ''],
        ['年收入 / Annual Income', formData.annualIncome || ''],
        ['僱主地址 / Employer Address', formData.employerAddress || ''],
        [''],
        ['資產 / Assets'],
        ['流動資產總值 / Total Liquid Assets', formData.totalLiquidAssets || ''],
        ['非流動資產總值 / Total Fixed Assets', formData.totalFixedAssets || ''],
        [''],
        ['受益人資訊 / Beneficiary Information'],
        ['在生期間受益人 / Living Beneficiary'],
        ['英文姓名 / English Name', formData.livingBeneficiaryEnglishName || ''],
        ['中文姓名 / Chinese Name', formData.livingBeneficiaryChineseName || ''],
        ['身份證號碼 / ID Number', formData.livingBeneficiaryID || ''],
        ['護照號碼 / Passport Number', formData.livingBeneficiaryPassport || ''],
        ['出生日期 / Date of Birth', formData.livingBeneficiaryDOB || ''],
        ['國籍 / Nationality', formData.livingBeneficiaryNationality || ''],
        ['與委託人關係 / Relationship', formData.livingBeneficiaryRelationship || ''],
        ['受益比例 / Share (%)', formData.livingBeneficiaryPercentage || ''],
        [''],
        ['身故後受益人 / Death Beneficiaries']
    ];
    
    // Add death beneficiaries
    for (let i = 1; i <= 5; i++) {
        if (formData[`deathBeneficiaryEnglishName${i}`]) {
            mainData.push(
                [`受益人 ${i} / Beneficiary ${i}`],
                ['英文姓名 / English Name', formData[`deathBeneficiaryEnglishName${i}`] || ''],
                ['中文姓名 / Chinese Name', formData[`deathBeneficiaryChineseName${i}`] || ''],
                ['身份證號碼 / ID Number', formData[`deathBeneficiaryID${i}`] || ''],
                ['與委託人關係 / Relationship', formData[`deathBeneficiaryRelationship${i}`] || ''],
                ['受益比例 / Share (%)', formData[`deathBeneficiaryPercentage${i}`] || ''],
                ['']
            );
        }
    }
    
    // Add submission info
    mainData.push(
        [''],
        ['提交資訊 / Submission Information'],
        ['提交日期 / Submission Date', formData.submissionDate || new Date().toISOString().split('T')[0]],
        ['同意條款 / Terms Agreed', formData.agreeTerms ? '是/Yes' : '否/No'],
        ['同意資料收集 / Data Collection Agreed', formData.agreeDataCollection ? '是/Yes' : '否/No']
    );
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(mainData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 40 }, // Column A
        { wch: 50 }  // Column B
    ];
    
    // Style header rows (basic styling)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = 0; row <= range.e.r; row++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: 0 })];
        if (cell && (
            cell.v === '基本資料 / Basic Information' ||
            cell.v === '聯絡資訊 / Contact Information' ||
            cell.v === '銀行資料 / Bank Information' ||
            cell.v === '資金來源 / Source of Funds' ||
            cell.v === '資產 / Assets' ||
            cell.v === '受益人資訊 / Beneficiary Information' ||
            cell.v === '提交資訊 / Submission Information'
        )) {
            // These are section headers
            cell.s = {
                font: { bold: true, sz: 14 },
                fill: { fgColor: { rgb: "F9F9F7" } }
            };
        }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "申請表單");
    
    // Generate filename with date
    const date = new Date();
    const dateStr = date.getFullYear() + 
                   String(date.getMonth() + 1).padStart(2, '0') + 
                   String(date.getDate()).padStart(2, '0');
    const filename = `信託申請表_${formData.englishName || 'unnamed'}_${dateStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Export to PDF (using browser print)
function exportToPDF() {
    window.print();
}

// Generate summary for email
function generateEmailSummary() {
    const storedData = localStorage.getItem('trustFormData');
    if (!storedData) return '';
    
    const formData = JSON.parse(storedData);
    
    let summary = `
國際離岸信託申請摘要
===================

申請人資料：
- 姓名：${formData.englishName} ${formData.chineseName ? `(${formData.chineseName})` : ''}
- 身份證號：${formData.idNumber}
- 出生日期：${formData.dateOfBirth}
- 國籍：${formData.nationality}
- 聯絡電話：${formData.contactNumber}
- 電郵：${formData.emailAddress}

銀行資料：
- 銀行：${formData.bankName}
- 帳戶名稱：${formData.accountName}
- 帳戶號碼：${formData.accountNumber}

受益人資料：
- 在生期間受益人：${formData.livingBeneficiaryEnglishName} (${formData.livingBeneficiaryPercentage}%)
`;

    // Add death beneficiaries
    for (let i = 1; i <= 5; i++) {
        if (formData[`deathBeneficiaryEnglishName${i}`]) {
            summary += `- 身故後受益人${i}：${formData[`deathBeneficiaryEnglishName${i}`]} (${formData[`deathBeneficiaryPercentage${i}`]}%)\n`;
        }
    }
    
    summary += `\n提交日期：${formData.submissionDate || new Date().toISOString().split('T')[0]}`;
    
    return summary;
}

// Create CSV export
function exportToCSV() {
    const storedData = localStorage.getItem('trustFormData');
    if (!storedData) {
        alert('沒有找到表單數據');
        return;
    }
    
    const formData = JSON.parse(storedData);
    
    // Prepare CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "\uFEFF"; // UTF-8 BOM for Excel
    
    // Add headers and data
    const rows = [
        ["欄位", "值"],
        ["顧問編號", formData.consultantCode || ''],
        ["顧問姓名", formData.consultantName || ''],
        ["英文姓名", formData.englishName || ''],
        ["中文姓名", formData.chineseName || ''],
        ["身份證號碼", formData.idNumber || ''],
        ["護照號碼", formData.passportNumber || ''],
        ["出生日期", formData.dateOfBirth || ''],
        ["國籍", formData.nationality || ''],
        ["出生地", formData.placeOfBirth || ''],
        ["住宅地址", formData.residentialAddress || ''],
        ["城市", formData.city || ''],
        ["省/州", formData.province || ''],
        ["郵政編碼", formData.postalCode || ''],
        ["國家", formData.country || ''],
        ["聯絡電話", formData.contactNumber || ''],
        ["電郵地址", formData.emailAddress || ''],
        ["銀行名稱", formData.bankName || ''],
        ["SWIFT代碼", formData.swiftCode || ''],
        ["帳戶名稱", formData.accountName || ''],
        ["帳戶號碼", formData.accountNumber || '']
    ];
    
    rows.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(",") + "\r\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `信託申請表_${formData.englishName || 'unnamed'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}
