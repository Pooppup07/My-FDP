// --- FDP & Rest Calculation Logic ---
const TABLE_A_FDP_MINUTES = { "0000-0359": [540], "0400-0459": [600], "0500-0559": [720, 675, 630, 585, 540], "0600-0759": [780, 735, 690, 645, 600], "0800-1259": [750, 705, 660, 615, 570, 540], "1300-1659": [720, 675, 630, 585, 540], "1700-2159": [660, 615, 570, 540], "2200-2359": [540, 540] };

function getTimeBand(reportTimeStr) { const timeVal = parseInt(reportTimeStr.replace(":", ""), 10); if (timeVal <= 359) return "0000-0359"; if (timeVal <= 459) return "0400-0459"; if (timeVal <= 559) return "0500-0559"; if (timeVal <= 759) return "0600-0759"; if (timeVal <= 1259) return "0800-1259"; if (timeVal <= 1659) return "1300-1659"; if (timeVal <= 2159) return "1700-2159"; if (timeVal <= 2359) return "2200-2359"; return null; }
function formatMinutesToHHMM(totalMinutes) { if (totalMinutes < 0) { totalMinutes += 24 * 60; } const h = Math.floor(totalMinutes / 60) % 24; const m = totalMinutes % 60; return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`; }

// --- Event Listeners ---
document.getElementById('calculateFdpBtn').addEventListener('click', () => {
    const reportTimeStr = document.getElementById('reportTime').value;
    const sectors = parseInt(document.getElementById('sectors').value, 10);
    const departureTimeStr = document.getElementById('departureTime').value; // รับค่าเวลาเครื่องออก
    const resultDiv = document.getElementById('detailedFdpResult');

    if (!reportTimeStr || !sectors || !departureTimeStr) {
        alert("กรุณากรอกข้อมูลให้ครบ: เวลาที่รายงานตัว, เวลาเครื่องออก และจำนวนเที่ยวบิน");
        return;
    }

    const timeBand = getTimeBand(reportTimeStr);
    if (!timeBand) {
        alert("เวลาที่รายงานตัวไม่ถูกต้อง");
        return;
    }

    const fdpLimits = TABLE_A_FDP_MINUTES[timeBand];
    let maxFdpMinutes;
    if (sectors > fdpLimits.length) {
        maxFdpMinutes = fdpLimits[fdpLimits.length - 1];
    } else {
        maxFdpMinutes = fdpLimits[sectors - 1];
    }

    // --- ส่วนคำนวณเวลาสิ้นสุด ---
    const reportTimeParts = reportTimeStr.split(':');
    const reportTimeTotalMinutes = parseInt(reportTimeParts[0], 10) * 60 + parseInt(reportTimeParts[1], 10);
    
    const fdpEndTimeTotalMinutes = reportTimeTotalMinutes + maxFdpMinutes;
    const fdpEndTimeStr = formatMinutesToHHMM(fdpEndTimeTotalMinutes);

    // สมมติว่าเวลา Taxi เข้าหลุมจอดคือ 15 นาที
    const landingTimeTotalMinutes = fdpEndTimeTotalMinutes - 15; 
    const landingTimeStr = formatMinutesToHHMM(landingTimeTotalMinutes);

    // --- อัปเดต UI ---
    document.getElementById('maxFdpDuration').textContent = formatMinutesToHHMM(maxFdpMinutes) + " ชั่วโมง";
    document.getElementById('fdpEndTime').textContent = fdpEndTimeStr;
    document.getElementById('latestLandingTime').textContent = landingTimeStr + " (โดยประมาณ)";
    document.getElementById('onBlocksTime').textContent = fdpEndTimeStr;
    
    resultDiv.style.display = 'block'; // แสดงผลลัพธ์
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

// ซ่อน Service Worker ไว้ก่อนเพื่อความง่ายในการทดสอบ
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => console.log('Service Worker: Registered')).catch(err => console.log(`Service Worker: Error: ${err}`))
    });
}
*/