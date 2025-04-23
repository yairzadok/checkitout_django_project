let participantsData = [];

function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function importExcel() {
    document.getElementById('excelFileInput').click();
}

document.getElementById('excelFileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        displayParticipants(jsonData);
    };
    reader.readAsArrayBuffer(file);
});

function displayParticipants(data) {
    participantsData = data;
    const container = document.getElementById('participantsContainer');
    const list = document.getElementById('participantsList');
    list.innerHTML = '';
    container.style.display = 'block';

    data.forEach(participant => {
        const row = document.createElement('div');
        row.className = 'participant-row';
        row.dataset.id = participant['ID'];

        const fullName = `${participant['First Name'] || ''} ${participant['Last Name'] || ''}`.trim();
        const phone = participant['Phone'] || '';

        row.innerHTML = `
            <div class="participant-name">
                <strong>${fullName}</strong>
                <small>
                    <a href="tel:${phone}" style="text-decoration: none; color: red;" title="התקשר למספר">
                        <span class="material-icons" style="font-size: 16px; vertical-align: middle;">call</span>
                    </a>
                    ${phone}
                </small>
            </div>
            <label><input type="checkbox" data-id="${participant['ID']}"> נוכח</label>
        `;

        list.appendChild(row);
    });
}

function scanQRCode() {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: 250 };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeMessage => {
            markPresenceById(qrCodeMessage.trim());
            html5QrCode.stop();
        },
        error => {
            console.warn("QR error", error);
        }
    );
}

function markPresenceById(id) {
    const checkbox = document.querySelector(`input[type="checkbox"][data-id="${id}"]`);
    if (checkbox) {
        checkbox.checked = true;
        const row = checkbox.closest('.participant-row');
        row.classList.add('present');
        alert(`נוכחות סומנה עבור משתתף עם ID: ${id}`);
    } else {
        alert(`משתתף עם ID ${id} לא נמצא ברשימה`);
    }
}

document.addEventListener('change', function (e) {
    if (e.target && e.target.matches('input[type="checkbox"][data-id]')) {
        const row = e.target.closest('.participant-row');
        if (e.target.checked) {
            row.classList.add('present');
        } else {
            row.classList.remove('present');
        }
    }
});

function showAbout() {
    document.getElementById('aboutModal').style.display = 'block';
}

function closeAbout() {
    document.getElementById('aboutModal').style.display = 'none';
}

function shareInfo() {
    alert("You clicked SHARE. (Implement actual share logic here)");
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('dropdownMenu');
    const button = document.querySelector('.menu-wrapper span');
    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.style.display = 'none';
    }
});

function sendParticipantsByEmail() {
    const now = new Date();
    const timestamp = now.toLocaleString('he-IL');
    const rows = document.querySelectorAll('.participant-row');

    if (rows.length === 0) {
        alert("אין משתתפים לשליחה.");
        return;
    }

    let bodyText = `דו״ח נוכחות - ${timestamp}\n\n`;
    bodyText += `שם מלא | טלפון | נוכחות\n`;
    bodyText += `-----------------------------\n`;

    rows.forEach(row => {
        const name = row.querySelector('strong')?.innerText || row.querySelector('label')?.innerText.split('\n')[0] || '';
        const phone = row.querySelector('small')?.innerText.replace(/^\s*📞?\s*/, '') || '';
        const checkbox = row.querySelector('input[type="checkbox"]');
        const status = checkbox.checked ? "✅ נוכח" : "❌ לא נוכח";

        bodyText += `${name} | ${phone} | ${status}\n`;
    });

    const subject = `דו״ח נוכחות - ${timestamp}`;
    const mailtoLink = `mailto:yair6655@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    window.location.href = mailtoLink;
}

function downloadParticipantList() {
    const now = new Date();
    const timestamp = now.toLocaleString('he-IL');
    const rows = document.querySelectorAll('.participant-row');

    let content = `שם פרטי,שם משפחה,טלפון,נוכחות,זמן שמירה\n`;

    rows.forEach(row => {
        const fullNameEl = row.querySelector('strong') || row.querySelector('label');
        const fullNameRaw = fullNameEl?.innerText.trim() || '';
        const fullName = fullNameRaw.replace(/\s+/g, ' ').trim();

        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const phone = row.querySelector('small')?.innerText.replace(/^\s*📞?\s*/, '').trim() || '';
        const checkbox = row.querySelector('input[type="checkbox"]');
        const status = checkbox.checked ? "נוכח" : "לא נוכח";

        content += `"${firstName}","${lastName}","${phone}","${status}","${timestamp}"\n`;
    });

    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `דו״ח_נוכחות.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
