// Gợi ý mẫu cho từng loại câu hỏi
const typeSamples = {
    multiple: `Câu 1. Đặc điểm của tự nhiên là gì?
a) Đáp án A
b) Đáp án B
c) Đáp án C
d) Đáp án D
*Đáp án: a`,
    truefalse: `Câu 2. Hàm số y = x^2 là hàm số bậc nhất.
*Đáp án: sai`,
    short: `Câu 3. Kết quả của 2 + 2 là bao nhiêu?
*Đáp án: 4`
};
const typeNotes = {
    multiple: 'Nhập 4 đáp án, mỗi đáp án 1 dòng bắt đầu bằng <code>a)</code>, <code>b)</code>, ... Đáp án đúng nhập <code>*Đáp án: a</code> hoặc <code>*Đáp án: b</code>.',
    truefalse: 'Chỉ nhập câu hỏi và đáp án đúng <code>*Đáp án: đúng</code> hoặc <code>*Đáp án: sai</code>.',
    short: 'Nhập câu hỏi và đáp án đúng <code>*Đáp án: ...</code> (câu trả lời ngắn).'
};

// Parse text thành object câu hỏi
function parseQuestion(text, type) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let question = '';
    let options = [];
    let answer = 0;
    if (type === 'multiple') {
        for (let i = 0; i < lines.length; i++) {
            if (i === 0) question = lines[0];
            else if (/^[a-d]\)/i.test(lines[i])) options.push(lines[i].replace(/^[a-d]\)\s*/i, ''));
            else if (lines[i].toLowerCase().startsWith('*đáp án:')) {
                const ans = lines[i].split(':')[1].trim().toLowerCase();
                answer = ['a','b','c','d'].indexOf(ans);
            }
        }
    } else if (type === 'truefalse') {
        question = lines[0] || '';
        options = ['Đúng', 'Sai'];
        answer = 0;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].toLowerCase().startsWith('*đáp án:')) {
                const ans = lines[i].split(':')[1].trim().toLowerCase();
                answer = (ans === 'đúng' || ans === 'dung') ? 0 : 1;
            }
        }
    } else if (type === 'short') {
        question = lines[0] || '';
        options = [];
        answer = '';
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].toLowerCase().startsWith('*đáp án:')) {
                answer = lines[i].split(':')[1].trim();
            }
        }
    }
    return {type, question, options, answer};
}

// Render preview
function renderPreview() {
    const type = document.getElementById('question-type').value;
    const text = document.getElementById('editor').value;
    const q = parseQuestion(text, type);
    let html = `<div style="font-weight:700;font-size:17px;margin-bottom:12px;"><span class='math-latex'>${q.question}</span></div>`;
    if (type === 'multiple') {
        q.options.forEach((opt, i) => {
            html += `<div style="margin-bottom:10px;">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="radio" name="preview" ${i===q.answer?'checked':''} disabled>
                    <span style="font-weight:700;color:#2d8cf0;">${String.fromCharCode(97+i)})</span> <span class='math-latex'>${opt}</span>
                </label>
            </div>`;
        });
    } else if (type === 'truefalse') {
        ['Đúng','Sai'].forEach((opt, i) => {
            html += `<div style="margin-bottom:10px;">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="radio" name="preview" ${i===q.answer?'checked':''} disabled>
                    <span style="font-weight:700;color:#2d8cf0;">${opt}</span>
                </label>
            </div>`;
        });
    } else if (type === 'short') {
        html += `<input type="text" style="width:80%;padding:6px 10px;border-radius:6px;border:1px solid #b3c6e0;" placeholder="Nhập đáp án...">`;
        if (q.answer) html += `<div style="margin-top:8px;font-size:13px;color:#888;">Đáp án đúng: <b class='math-latex'>${q.answer}</b></div>`;
    }
    document.getElementById('question-preview').innerHTML = html;
    // Render LaTeX using latex.js
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise();
    }
}

// Khi đổi loại câu hỏi, đổi mẫu và note
document.getElementById('question-type').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('editor').value = typeSamples[type];
    document.getElementById('note').innerHTML = typeNotes[type];
    renderPreview();
});

document.getElementById('editor').addEventListener('input', renderPreview);

// Hiển thị note ban đầu
document.getElementById('note').innerHTML = typeNotes['multiple'];
renderPreview();

// Lưu câu hỏi vào danh sách (localStorage demo)
function saveQuestion() {
    const type = document.getElementById('question-type').value;
    const text = document.getElementById('editor').value;
    const q = parseQuestion(text, type);

    if (!q.question || (type === 'multiple' && q.options.length < 2) || (type === 'short' && !q.answer)) {
        alert('Vui lòng nhập đủ nội dung và đáp án!');
        return;
    }

    let list = JSON.parse(localStorage.getItem('questions') || '[]');

    // Tìm id lớn nhất hiện có (cả trong localStorage và questions.json nếu muốn)
    let maxId = 0;
    list.forEach(item => { if (item.id && item.id > maxId) maxId = item.id; });

    // Nếu muốn đồng bộ với questions.json, fetch và lấy maxId lớn nhất trong cả hai
    // fetch('../db/questions.json').then(res => res.json()).then(jsonList => { ... })

    // Gán id mới
    q.id = maxId + 1;

    list.push(q);
    localStorage.setItem('questions', JSON.stringify(list));
    renderQuestionsLocalList();
    alert('Đã lưu câu hỏi!');
}
document.getElementById('save-btn').onclick = saveQuestion;

// Xuất câu hỏi tự nhập ra file JSON
document.getElementById('export-json-btn').onclick = function() {
    const list = JSON.parse(localStorage.getItem('questions') || '[]');
    const json = JSON.stringify(list, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "questions.json";
    a.click();
    URL.revokeObjectURL(url);
};

// Hiển thị câu hỏi từ questions.json
function renderQuestionsJsonList() {
    fetch('../db/questions.json')
      .then(res => res.json())
      .then(list => {
        const tbody = document.getElementById('questions-json-list');
        tbody.innerHTML = '';
        list.forEach((q, idx) => {
            let typeLabel = '';
            if (q.type === 'multiple') typeLabel = 'Trắc nghiệm';
            else if (q.type === 'truefalse') typeLabel = 'Đúng/Sai';
            else if (q.type === 'short') typeLabel = 'Trả lời ngắn';
            let answerHtml = '';
            if (q.type === 'multiple') {
                answerHtml = q.options.map((opt,i) =>
                    `<span style="color:${i===q.answer?'#2d8cf0':'#333'}">${String.fromCharCode(97+i)}) ${opt}</span>`
                ).join('<br>');
            } else if (q.type === 'truefalse') {
                answerHtml = `<span style="color:#2d8cf0;">${q.answer === 0 ? 'Đúng' : 'Sai'}</span>`;
            } else if (q.type === 'short') {
                answerHtml = `<span style="color:#2d8cf0;">${q.answer}</span>`;
            }
            tbody.innerHTML += `
                <tr>
                    <td>${idx+1}</td>
                    <td class="type">${typeLabel}</td>
                    <td>${q.question}</td>
                    <td>${answerHtml}</td>
                </tr>
            `;
        });
      });
}

// Hiển thị câu hỏi từ localStorage
function renderQuestionsLocalList() {
    let list = JSON.parse(localStorage.getItem('questions') || '[]');
    const tbody = document.getElementById('questions-local-list');
    tbody.innerHTML = '';
    list.forEach((q, idx) => {
        let typeLabel = '';
        if (q.type === 'multiple') typeLabel = 'Trắc nghiệm';
        else if (q.type === 'truefalse') typeLabel = 'Đúng/Sai';
        else if (q.type === 'short') typeLabel = 'Trả lời ngắn';
        let answerHtml = '';
        if (q.type === 'multiple') {
            answerHtml = q.options.map((opt,i) =>
                `<span style="color:${i===q.answer?'#2d8cf0':'#333'}">${String.fromCharCode(97+i)}) ${opt}</span>`
            ).join('<br>');
        } else if (q.type === 'truefalse') {
            answerHtml = `<span style="color:#2d8cf0;">${q.answer === 0 ? 'Đúng' : 'Sai'}</span>`;
        } else if (q.type === 'short') {
            answerHtml = `<span style="color:#2d8cf0;">${q.answer}</span>`;
        }
        tbody.innerHTML += `
            <tr>
                <td>${idx+1}</td>
                <td class="type">${typeLabel}</td>
                <td>${q.question}</td>
                <td>${answerHtml}</td>
                <td><button onclick="removeQuestion(${idx})">Xóa</button></td>
            </tr>
        `;
    });
}
window.removeQuestion = function(idx) {
    let list = JSON.parse(localStorage.getItem('questions') || '[]');
    list.splice(idx,1);
    localStorage.setItem('questions', JSON.stringify(list));
    renderQuestionsLocalList();
}

// Khởi tạo
renderQuestionsJsonList();
renderQuestionsLocalList();

// Khởi tạo mẫu ban đầu
document.getElementById('editor').value = typeSamples['multiple'];