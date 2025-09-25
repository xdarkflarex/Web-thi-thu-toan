// Tài khoản mẫu
const studentAccounts = [
  { name: "Nguyễn Văn A", code: "hs001" },
  { name: "Trần Thị B", code: "hs002" }
];
const teacherAccounts = [
  { name: "Đinh Xuân Minh", code: "gv001" },
  { name: "Nguyễn Thị C", code: "gv002" }
];

// Lấy các phần tử
const loginModal = document.getElementById('login-modal');
const loginTitle = document.getElementById('login-title');
const loginName = document.getElementById('login-name');
const loginCode = document.getElementById('login-code');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const closeBtn = document.getElementById('close-login-modal');
let loginRole = '';

// Mở modal đăng nhập học sinh
document.getElementById('open-student-login').onclick = function() {
  loginRole = 'student';
  loginTitle.textContent = 'Đăng nhập học sinh';
  loginModal.style.display = 'flex';
  loginName.value = '';
  loginCode.value = '';
  loginError.style.display = 'none';
};
// Mở modal đăng nhập giáo viên
document.getElementById('open-teacher-login').onclick = function() {
  loginRole = 'teacher';
  loginTitle.textContent = 'Đăng nhập giáo viên';
  loginModal.style.display = 'flex';
  loginName.value = '';
  loginCode.value = '';
  loginError.style.display = 'none';
};
// Đóng modal
closeBtn.onclick = function() {
  loginModal.style.display = 'none';
};
// Đăng nhập
loginBtn.onclick = function() {
  if (!loginName.value.trim()) {
    loginError.textContent = 'Vui lòng nhập họ tên.';
    loginError.style.display = 'block';
    return;
  }
  if (!loginCode.value.trim()) {
    loginError.textContent = 'Vui lòng nhập mã.';
    loginError.style.display = 'block';
    return;
  }
  if (loginRole === 'student') {
    const found = studentAccounts.find(acc =>
      acc.name.toLowerCase() === loginName.value.trim().toLowerCase() &&
      acc.code.toLowerCase() === loginCode.value.trim().toLowerCase()
    );
    if (found) {
      localStorage.setItem('studentName', found.name);
      localStorage.setItem('studentCode', found.code);
      window.location.href = 'student.html';
    } else {
      loginError.textContent = 'Sai tên hoặc mã học sinh!';
      loginError.style.display = 'block';
    }
  } else if (loginRole === 'teacher') {
    const found = teacherAccounts.find(acc =>
      acc.name.toLowerCase() === loginName.value.trim().toLowerCase() &&
      acc.code.toLowerCase() === loginCode.value.trim().toLowerCase()
    );
    if (found) {
      localStorage.setItem('teacherName', found.name);
      localStorage.setItem('teacherCode', found.code);
      window.location.href = 'teacher.html';
    } else {
      loginError.textContent = 'Sai tên hoặc mã giáo viên!';
      loginError.style.display = 'block';
    }
  }
};
// Đóng modal khi bấm ngoài
loginModal.onclick = function(e) {
  if (e.target === loginModal) loginModal.style.display = 'none';
};