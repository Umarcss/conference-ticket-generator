let selectedAvatarFile = null;
let currentObjectUrl = null;

const form = document.getElementById("form");
const inputs = document.querySelectorAll("#name, #email, #username");
const fileInput = document.getElementById("upload");
const dropZone = document.getElementById("drop-zone");
const avatarError = document.getElementById("avatar-error");

// Helper functions
function clearError(input) {
  const field = input.id;
  const errorSpan = document.getElementById(`${field}-error`);
  const errorContainer = errorSpan.closest(".error");
  const errorIcon = errorContainer.querySelector(".info-icon");

  input.classList.remove("input-error");
  errorSpan.removeAttribute("aria-invalid");
  errorSpan.removeAttribute("aria-label");
  errorSpan.textContent = "";
  if (errorIcon) errorIcon.style.display = "none";
}

function clearAvatarError() {
  if (!avatarError) return;
  avatarError.textContent = "Upload your photo (JPG or PNG, max size: 500KB).";
  avatarError.removeAttribute("aria-invalid");
  avatarError.removeAttribute("aria-label");
  avatarError.classList.remove("error-active");
  const icon = avatarError.closest(".error").querySelector(".info-icon");
  if (icon) icon.classList.remove("error-active");
}

function setAvatarError(msg) {
  if (!avatarError) return;
  avatarError.textContent = msg;
  avatarError.setAttribute("aria-invalid", "true");
  avatarError.setAttribute("aria-label", msg);
  avatarError.classList.add("error-active");
  const icon = avatarError.closest(".error").querySelector(".info-icon");
  if (icon) icon.classList.add("error-active");
}

function revokeObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

// Input listeners
inputs.forEach((input) => {
  input.addEventListener("input", () => clearError(input));
});

// Validators
function validateName(value) {
  if (!value.trim()) return "Please enter your name";
  if (!/^[A-Za-z\s'-]+$/.test(value)) return "Please enter a correct name";
  return "";
}

function validateEmail(value) {
  if (!value.trim()) return "Please enter your email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Please enter a valid email address";
  return "";
}

function validateUsername(value) {
  if (!value.trim()) return "Please enter your username";
  if (!/^@/.test(value)) return "Username must start with @";
  const usernameWithoutAt = value.slice(1);
  if (
    !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(usernameWithoutAt)
  ) {
    return "Please enter a valid GitHub username";
  }
  return "";
}

function validateAvatar(file) {
  if (!file) return "Upload your photo (JPG or PNG, max size: 500KB).";
  const validTypes = ["image/jpeg", "image/png"];
  if (!validTypes.includes(file.type))
    return "Upload your photo (JPG or PNG, max size: 500KB).";
  if (file.size > 500 * 1024)
    return "File too large. Please upload a photo under 500KB.";
  return "";
}

const validators = {
  name: validateName,
  email: validateEmail,
  username: validateUsername,
  avatar: validateAvatar,
};

// Avatar handling
function handleAvatarFile(file) {
  if (!file) return;

  const errorMsg = validateAvatar(file);
  if (errorMsg) {
    setAvatarError(errorMsg);
    return;
  }

  selectedAvatarFile = file;
  clearAvatarError();

  revokeObjectUrl();
  currentObjectUrl = URL.createObjectURL(file);

  dropZone
    .querySelectorAll("img, .btn-container, label.upload-label")
    .forEach((el) => el.remove());

  const img = document.createElement("img");
  img.src = currentObjectUrl;
  img.alt = "Uploaded Avatar";
  img.className = "preview-image";
  img.style.maxWidth = "100%";
  img.style.borderRadius = "12px";

  const btnContainer = document.createElement("div");
  btnContainer.className = "btn-container";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove image";
  removeBtn.addEventListener("click", () => {
    selectedAvatarFile = null;
    revokeObjectUrl();
    fileInput.value = "";
    dropZone
      .querySelectorAll("img, .btn-container")
      .forEach((el) => el.remove());

    if (!dropZone.querySelector("label.upload-label")) {
      const label = document.createElement("label");
      label.setAttribute("for", "upload");
      label.className = "upload-label";
      label.setAttribute("aria-describedby", "avatar-error");
      label.innerHTML = `
        <span class="upload-icon" aria-hidden="true">
          <img src="./images/icon-upload.svg" width="30" height="30" loading="lazy" decoding="async" alt="">
        </span>
        <span class="upload-text">Drag and drop or click to upload</span>
      `;
      dropZone.appendChild(label);
    }

    clearAvatarError();
  });

  const changeBtn = document.createElement("button");
  changeBtn.type = "button";
  changeBtn.textContent = "Change image";
  changeBtn.addEventListener("click", () => fileInput.click());

  btnContainer.appendChild(removeBtn);
  btnContainer.appendChild(changeBtn);

  dropZone.appendChild(img);
  dropZone.appendChild(btnContainer);
}

// Drag & drop
dropZone.addEventListener("dragover", (e) => e.preventDefault());
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length) handleAvatarFile(e.dataTransfer.files[0]);
});

// File input
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) handleAvatarFile(fileInput.files[0]);
});

// Form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  let isValid = true;

  for (const [field, validator] of Object.entries(validators)) {
    if (field === "avatar") {
      const avatarErrorMsg = validator(selectedAvatarFile);
      if (avatarErrorMsg) {
        setAvatarError(avatarErrorMsg);
        isValid = false;
      } else {
        clearAvatarError();
      }
      continue;
    }

    const value = data[field];
    const errorSpan = document.getElementById(`${field}-error`);
    const inputEl = document.getElementById(field);
    const errorIcon = errorSpan.closest(".error").querySelector(".info-icon");

    const errorMessage = validator(value);

    if (errorMessage) {
      isValid = false;
      inputEl.classList.add("input-error");
      if (errorIcon) errorIcon.style.display = "block";
      errorSpan.textContent = errorMessage;
      errorSpan.setAttribute("aria-invalid", "true");
      errorSpan.setAttribute("aria-label", errorMessage);
    } else {
      inputEl.classList.remove("input-error");
      if (errorIcon) errorIcon.style.display = "none";
      errorSpan.textContent = "";
      errorSpan.removeAttribute("aria-invalid");
      errorSpan.removeAttribute("aria-label");
    }
  }

  if (!isValid) return;

  // Populate ticket
  const submittedNameEl = document.getElementById("submitted-name");
  const words = data.name.trim().split(/\s+/);
  submittedNameEl.innerHTML = words
    .map((word, i) => (i === words.length - 1 ? `${word}!` : word))
    .map((word) => `<span>${word}</span>`)
    .join(" ");

  document.getElementById("ticket-name").textContent = data.name;
  document.getElementById("submitted-email").textContent = data.email;
  document.getElementById("submitted-username").textContent = data.username;
  document.getElementById("intro").style.display = "none";
  document.getElementById("success").style.display = "block";

  // Avatar preview
  if (selectedAvatarFile) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ticketAvatar = document.getElementById("ticket-avatar");
      if (ticketAvatar) ticketAvatar.src = ev.target.result;
    };
    reader.readAsDataURL(selectedAvatarFile);
  }
});

const dropZoneClickable = document.getElementById("drop-zone");

dropZoneClickable.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});
