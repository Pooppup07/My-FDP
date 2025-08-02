// ▼▼▼ ตาราง FDP ใหม่ ตามที่คุณระบุ (แปลงเป็นนาที) ▼▼▼
const TABLE_A_FDP_MINUTES = {
    // 06:00 - 07:59
    "0600-0759": [780, 735, 705, 675, 645, 585, 540, 540], // 13:00, 12:15, 11:45, ...
    // 08:00 - 14:59
    "0800-1459": [810, 795, 750, 705, 675, 645, 570, 540], // 13:30, 13:15, 12:30, ...
    // 15:00 - 18:59
    "1500-1859": [780, 765, 720, 675, 645, 600, 540, 540], // 13:00, 12:45, 12:00, ...
    // 19:00 - 00:59
    "1900-0059": [720, 705, 660, 615, 585, 540, 540, 540], // 12:00, 11:45, 11:00, ...
    // 01:00 - 05:59
    "0100-0559": [660, 645, 600, 570, 540, 540, 540, 540]  // 11:00, 10:45, 10:00, ...
};

// ▼▼▼ ฟังก์ชัน getTimeBand ที่อัปเดตแล้วให้ตรงกับตารางใหม่ ▼▼▼
function getTimeBand(reportTimeStr) {
    const timeVal = parseInt(reportTimeStr.replace(":", ""), 10);
    if (timeVal >= 600 && timeVal <= 759) return "0600-0759";
    if (timeVal >= 800 && timeVal <= 1459) return "0800-1459";
    if (timeVal >= 1500 && timeVal <= 1859) return "1500-1859";
    // สำหรับช่วง 19:00 - 00:59 ที่ข้ามวัน
    if ((timeVal >= 1900 && timeVal <= 2359) || (timeVal >= 0 && timeVal <= 59)) return "1900-0059";
    if (timeVal >= 100 && timeVal <= 559) return "0100-0559";
    return null; // ถ้าไม่เข้าเงื่อนไขไหนเลย
}

// --- ฟังก์ชันช่วยเหลือ (ไม่มีการเปลี่ยนแปลง) ---
function formatMinutesToHHMM(totalMinutes) {
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// --- Event Listeners (ไม่มีการเปลี่ยนแปลง) ---
document.getElementById('calculateFdpBtn').addEventListener('click', () => {
    const reportTimeStr = document.getElementById('reportTime').value;
    const sectors = parseInt(document.getElementById('sectors').value, 10);
    const resultDiv = document.getElementById('detailedFdpResult');

    if (!reportTimeStr || !sectors) {
        alert("กรุณากรอกข้อมูลให้ครบ: เวลาที่รายงานตัว และจำนวนเที่ยวบิน");
        // ซ่อนผลลัพธ์เก่าถ้ามี
        resultDiv.style.display = 'none';
        return;
    }

    const timeBand = getTimeBand(reportTimeStr);
    if (!timeBand) {
        alert("ไม่พบช่วงเวลาสำหรับคำนวณ FDP กรุณาตรวจสอบเวลาที่รายงานตัว");
        resultDiv.style.display = 'none';
        return;
    }

    const fdpLimits = TABLE_A_FDP_MINUTES[timeBand];
    let maxFdpMinutes;

    if (sectors >= fdpLimits.length) {
        // ถ้าบิน 8 เที่ยวหรือมากกว่า ให้ใช้ค่าสุดท้ายใน array
        maxFdpMinutes = fdpLimits[fdpLimits.length - 1];
    } else {
        // Sector เริ่มที่ 1 แต่ Array index เริ่มที่ 0
        maxFdpMinutes = fdpLimits[sectors - 1];
    }

    // --- ส่วนคำนวณเวลาสิ้นสุด ---
    const reportTimeParts = reportTimeStr.split(':');
    const reportTimeTotalMinutes = parseInt(reportTimeParts[0], 10) * 60 + parseInt(reportTimeParts[1], 10);
    
    const fdpEndTimeTotalMinutes = reportTimeTotalMinutes + maxFdpMinutes;
    const fdpEndTimeStr = formatMinutesToHHMM(fdpEndTimeTotalMinutes);

    const landingTimeTotalMinutes = fdpEndTimeTotalMinutes - 15; 
    const landingTimeStr = formatMinutesToHHMM(landingTimeTotalMinutes);

    // --- อัปเดต UI ---
    document.getElementById('maxFdpDuration').textContent = formatMinutesToHHMM(maxFdpMinutes) + " ชั่วโมง";
    document.getElementById('fdpEndTime').textContent = fdpEndTimeStr;
    document.getElementById('latestLandingTime').textContent = landingTimeStr + " (โดยประมาณ)";
    document.getElementById('onBlocksTime').textContent = fdpEndTimeStr;
    
    resultDiv.style.display = 'block';
});

document.getElementById('calculateRestBtn').addEventListener('click', () => {
    const actualFdpHours = parseFloat(document.getElementById('actualFdp').value);
    const resultDiv = document.getElementById('restResult');
    if (isNaN(actualFdpHours) || actualFdpHours <= 0) { resultDiv.textContent = "กรุณากรอก FDP ที่ถูกต้อง"; return; }
    let minRestHours;
    if (actualFdpHours <= 8) minRestHours = 8;
    else if (actualFdpHours <= 10) minRestHours = 10;
    else if (actualFdpHours <= 12) minRestHours = 12;
    else if (actualFdpHours <= 16) minRestHours = 18;
    else if (actualFdpHours <= 20) minRestHours = 24;
    else { resultDiv.textContent = "FDP นานเกินข้อกำหนด"; return; }
    resultDiv.textContent = `ต้องพักอย่างน้อย: ${minRestHours} ชั่วโมง`;
});

// โค้ด Service Worker สำหรับ PWA (ไม่มีการเปลี่ยนแปลง)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => console.log('Service Worker: Registered', reg)).catch(err => console.log(`Service Worker: Error: ${err}`))
    });
}
