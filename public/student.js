// ==== Đăng nhập và load câu hỏi cho student.html ====
window.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const name = localStorage.getItem('studentName');
    if (!name) {
        document.getElementById('student-login-modal').style.display = 'flex';
        document.getElementById('student-main').style.display = 'none';
    } else {
        document.getElementById('student-name-header').textContent = name;
        document.getElementById('student-login-modal').style.display = 'none';
        document.getElementById('student-main').style.display = 'flex';
        loadQuestions();
    }

    document.getElementById('student-login-btn').onclick = function() {
        const name = document.getElementById('student-login-name').value.trim();
        if (!name) {
            document.getElementById('student-login-error').textContent = 'Vui lòng nhập họ tên!';
            document.getElementById('student-login-error').style.display = 'block';
            return;
        }
        localStorage.setItem('studentName', name);
        document.getElementById('student-name-header').textContent = name;
        document.getElementById('student-login-modal').style.display = 'none';
        document.getElementById('student-main').style.display = 'flex';
        loadQuestions();
    };

    document.getElementById('student-login-cancel').onclick = function() {
        window.location.href = 'index.html';
    };

    document.getElementById('student-logout-btn').onclick = function() {
        localStorage.removeItem('studentName');
        window.location.reload();
    };
});

function loadQuestions() {
    fetch('../db/questions.json')
        .then(res => res.json())
        .then(questions => {
            renderQuizForm(questions);
            renderQuestionTable(questions);
        })
        .catch(err => {
            document.getElementById('quiz-form').innerHTML = '<div style="color:red">Không tải được câu hỏi!";</div>';
            console.error('Lỗi tải câu hỏi:', err);
        });
}

function renderQuizForm(questions) {
    const form = document.getElementById('quiz-form');
    form.innerHTML = '';
    questions.forEach((q, idx) => {
        let html = `<div class="quiz-question" id="quiz-question-${idx}"><div class="quiz-q-title"><b>Câu ${idx+1}:</b> <span class='math-latex'>${q.question}</span></div>`;
        if (q.type === 'multiple') {
            q.options.forEach((opt, i) => {
                html += `
                <label class="quiz-option">
                    <input type="radio" name="q${idx}" value="${i}" onchange="updateAnswered(${idx}, true)">
                    <span class="option-label">${String.fromCharCode(97+i)}</span>
                    <span class="option-content"><span class='math-latex'>${opt}</span></span>
                </label>`;
            });
        } else if (q.type === 'truefalse') {
            html += `
                <label class="quiz-option">
                    <input type="radio" name="q${idx}" value="0" onchange="updateAnswered(${idx}, true)">
                    <span class="option-label">A</span>
                    <span class="option-content">Đúng</span>
                </label>
                <label class="quiz-option">
                    <input type="radio" name="q${idx}" value="1" onchange="updateAnswered(${idx}, true)">
                    <span class="option-label">B</span>
                    <span class="option-content">Sai</span>
                </label>`;
        } else if (q.type === 'short') {
            html += `<input type="text" name="q${idx}" style="width:60%;" oninput="updateAnswered(${idx}, true)">`;
        }
        html += '</div>';
        form.innerHTML += html;
    });
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise();
    }
}

function renderQuestionTable(questions) {
    const tbody = document.getElementById('question-table-body');
    tbody.innerHTML = '';
    let row = document.createElement('tr');
    questions.forEach((q, idx) => {
        const td = document.createElement('td');
        td.style.padding = '2px';
        td.innerHTML = `<button type="button" class="question-nav-btn" id="nav-btn-${idx}" onclick="scrollToQuestion(${idx})">${idx+1}</button>`;
        row.appendChild(td);
        // 5 nút 1 dòng, sang dòng mới
        if ((idx+1) % 5 === 0) {
            tbody.appendChild(row);
            row = document.createElement('tr');
        }
    });
    if (row.children.length > 0) tbody.appendChild(row);
}

window.scrollToQuestion = function(idx) {
    const form = document.getElementById('quiz-form');
    const qs = form.querySelectorAll('.quiz-question');
    if (qs[idx]) {
        qs[idx].scrollIntoView({behavior:'smooth', block:'center'});
        setActiveNavBtn(idx);
    }
};

function setActiveNavBtn(idx) {
    document.querySelectorAll('.question-nav-btn').forEach((btn, i) => {
        if (i === idx) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

window.updateAnswered = function(idx, scrollToNav) {
    // Đánh dấu nút đã trả lời nếu có đáp án
    const form = document.getElementById('quiz-form');
    const q = form.querySelectorAll('.quiz-question')[idx];
    let answered = false;
    const radios = q.querySelectorAll('input[type="radio"]');
    if (radios.length) {
        radios.forEach(r => { if (r.checked) answered = true; });
    } else {
        const txt = q.querySelector('input[type="text"]');
        if (txt && txt.value.trim() !== '') answered = true;
    }
    const btn = document.getElementById('nav-btn-' + idx);
    if (btn) {
        if (answered) btn.classList.add('answered');
        else btn.classList.remove('answered');
        // Nếu vừa trả lời xong thì highlight nút và cuộn vào giữa bảng điều hướng
        if (answered && scrollToNav) {
            btn.classList.add('just-answered');
            setTimeout(() => btn.classList.remove('just-answered'), 800);
            // Cuộn nút vào giữa bảng điều hướng nếu bị khuất
            btn.scrollIntoView({behavior:'smooth', block:'center', inline:'center'});
        }
    }
};

// Tự động active nút đầu tiên khi load
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => setActiveNavBtn(0), 300);
});

// Khi cuộn, tự động active nút tương ứng
document.addEventListener('scroll', function() {
    const form = document.getElementById('quiz-form');
    if (!form) return;
    const qs = form.querySelectorAll('.quiz-question');
    let found = 0;
    for (let i = 0; i < qs.length; i++) {
        const rect = qs[i].getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight/2) {
            found = i;
            break;
        }
    }
    setActiveNavBtn(found);
});

// ĐỒNG HỒ ĐẾM NGƯỢC
let timerInterval;
function startTimer(duration) {
    let timer = duration, hours, minutes, seconds;
    const timerEl = document.getElementById('timer');
    timerInterval = setInterval(function () {
        hours = Math.floor(timer / 3600);
        minutes = Math.floor((timer % 3600) / 60);
        seconds = timer % 60;
        timerEl.textContent = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            timerEl.textContent = '00:00:00';
            alert('Hết thời gian làm bài! Bài sẽ được nộp tự động.');
            document.getElementById('submit-btn').click();
        }
    }, 1000);
}

window.addEventListener('DOMContentLoaded', function() {
    // 1 tiếng 30 phút = 5400 giây
    startTimer(5400);
});
