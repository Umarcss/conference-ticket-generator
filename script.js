// Conference Ticket Generator JavaScript

class TicketGenerator {
  constructor() {
    this.form = document.getElementById('ticket-form');
    this.formSection = document.getElementById('form-section');
    this.ticketSection = document.getElementById('ticket-section');
    this.uploadInput = document.getElementById('avatar-upload');
    this.uploadArea = document.getElementById('upload-area');
    this.uploadPreview = document.getElementById('upload-preview');
    this.previewImage = document.getElementById('preview-image');
    this.removeAvatarBtn = document.getElementById('remove-avatar');
    this.submitBtn = document.getElementById('submit-btn');
    this.generateNewBtn = document.getElementById('generate-new-btn');
    
    this.uploadedFile = null;
    this.isValid = {
      avatar: false,
      fullName: false,
      email: false,
      github: false
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.setupFormValidation();
  }
  
  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // File upload
    this.uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
    this.removeAvatarBtn.addEventListener('click', () => this.removeAvatar());
    
    // Generate new ticket
    this.generateNewBtn.addEventListener('click', () => this.generateNewTicket());
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }
  
  setupDragAndDrop() {
    const uploadContainer = document.getElementById('upload-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadContainer.addEventListener(eventName, this.preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadContainer.addEventListener(eventName, () => this.highlight(), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      uploadContainer.addEventListener(eventName, () => this.unhighlight(), false);
    });
    
    uploadContainer.addEventListener('drop', (e) => this.handleDrop(e), false);
  }
  
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  highlight() {
    this.uploadArea.classList.add('dragover');
  }
  
  unhighlight() {
    this.uploadArea.classList.remove('dragover');
  }
  
  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
  }
  
  handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }
  
  handleFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.showError('avatar-error', 'Please upload a JPG or PNG image.');
      return;
    }
    
    // Validate file size (500KB = 500 * 1024 bytes)
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      this.showError('avatar-error', 'File size must be less than 500KB.');
      return;
    }
    
    // Clear any existing errors
    this.clearError(document.getElementById('avatar-upload'));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage.src = e.target.result;
      this.uploadArea.style.display = 'none';
      this.uploadPreview.style.display = 'flex';
      this.uploadedFile = file;
      this.isValid.avatar = true;
      this.updateSubmitButton();
    };
    reader.readAsDataURL(file);
  }
  
  removeAvatar() {
    this.uploadInput.value = '';
    this.uploadArea.style.display = 'flex';
    this.uploadPreview.style.display = 'none';
    this.previewImage.src = '';
    this.uploadedFile = null;
    this.isValid.avatar = false;
    this.clearError(document.getElementById('avatar-upload'));
    this.updateSubmitButton();
  }
  
  setupFormValidation() {
    // Email validation regex
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // GitHub username validation regex (alphanumeric, hyphens, underscores)
    this.githubRegex = /^[a-zA-Z0-9_-]+$/;
  }
  
  validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    
    switch (fieldName) {
      case 'fullName':
        this.validateFullName(value);
        break;
      case 'email':
        this.validateEmail(value);
        break;
      case 'github':
        this.validateGithub(value);
        break;
    }
    
    this.updateSubmitButton();
  }
  
  validateFullName(value) {
    if (!value) {
      this.showError('name-error', 'Full name is required.');
      this.isValid.fullName = false;
    } else if (value.length < 2) {
      this.showError('name-error', 'Full name must be at least 2 characters.');
      this.isValid.fullName = false;
    } else {
      this.clearError(document.getElementById('full-name'));
      this.isValid.fullName = true;
    }
  }
  
  validateEmail(value) {
    if (!value) {
      this.showError('email-error', 'Email address is required.');
      this.isValid.email = false;
    } else if (!this.emailRegex.test(value)) {
      this.showError('email-error', 'Please enter a valid email address.');
      this.isValid.email = false;
    } else {
      this.clearError(document.getElementById('email'));
      this.isValid.email = true;
    }
  }
  
  validateGithub(value) {
    if (!value) {
      this.showError('github-error', 'GitHub username is required.');
      this.isValid.github = false;
    } else if (!this.githubRegex.test(value)) {
      this.showError('github-error', 'GitHub username can only contain letters, numbers, hyphens, and underscores.');
      this.isValid.github = false;
    } else if (value.length < 3) {
      this.showError('github-error', 'GitHub username must be at least 3 characters.');
      this.isValid.github = false;
    } else {
      this.clearError(document.getElementById('github'));
      this.isValid.github = true;
    }
  }
  
  showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.setAttribute('aria-live', 'polite');
  }
  
  clearError(input) {
    const fieldName = input.name;
    const errorId = fieldName === 'fullName' ? 'name-error' : 
                   fieldName === 'email' ? 'email-error' : 
                   fieldName === 'github' ? 'github-error' : 'avatar-error';
    
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = '';
    errorElement.removeAttribute('aria-live');
  }
  
  updateSubmitButton() {
    const allValid = Object.values(this.isValid).every(valid => valid);
    this.submitBtn.disabled = !allValid;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    this.validateField(document.getElementById('full-name'));
    this.validateField(document.getElementById('email'));
    this.validateField(document.getElementById('github'));
    
    // Check if all fields are valid
    const allValid = Object.values(this.isValid).every(valid => valid);
    
    if (!allValid) {
      // Focus on first invalid field
      const firstInvalidField = this.form.querySelector('.form-input:invalid, .form-input[aria-invalid="true"]');
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }
    
    // Show loading state
    this.submitBtn.classList.add('loading');
    this.submitBtn.disabled = true;
    
    // Simulate processing delay
    setTimeout(() => {
      this.generateTicket();
    }, 1000);
  }
  
  generateTicket() {
    const formData = new FormData(this.form);
    
    // Get form values
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const github = formData.get('github');
    
    // Update success message
    document.getElementById('success-name').textContent = fullName;
    document.getElementById('success-email').textContent = email;
    
    // Update ticket details
    const ticketNameEl = document.getElementById('ticket-name');
    if (ticketNameEl) ticketNameEl.textContent = fullName;
    const ticketEmailEl = document.getElementById('ticket-email');
    if (ticketEmailEl) ticketEmailEl.textContent = email;
    const ticketGithubEl = document.getElementById('ticket-github');
    if (ticketGithubEl) ticketGithubEl.textContent = `@${github}`;
    
    // Update ticket avatar if uploaded
    const ticketAvatar = document.getElementById('ticket-avatar');
    const ticketAvatarContainer = document.getElementById('ticket-avatar-container');
    
    if (this.uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        ticketAvatar.src = e.target.result;
        ticketAvatar.style.display = 'block';
        ticketAvatarContainer.style.display = 'block';
      };
      reader.readAsDataURL(this.uploadedFile);
    } else {
      ticketAvatar.style.display = 'none';
      ticketAvatarContainer.style.display = 'none';
    }
    
    // Hide form and show ticket
    this.formSection.style.display = 'none';
    this.ticketSection.style.display = 'flex';
    
    // Remove loading state
    this.submitBtn.classList.remove('loading');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Announce success to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Ticket generated successfully for ${fullName}`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  generateNewTicket() {
    // Reset form
    this.form.reset();
    this.removeAvatar();
    
    // Reset validation state
    this.isValid = {
      avatar: false,
      fullName: false,
      email: false,
      github: false
    };
    
    // Clear all errors
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(error => {
      error.textContent = '';
      error.removeAttribute('aria-live');
    });
    
    // Show form and hide ticket
    this.formSection.style.display = 'flex';
    this.ticketSection.style.display = 'none';
    
    // Focus on first input
    document.getElementById('avatar-upload').focus();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Utility function for screen reader only content
function createScreenReaderOnly() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  document.head.appendChild(style);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  createScreenReaderOnly();
  new TicketGenerator();
});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
  // Escape key to close any modals or go back
  if (e.key === 'Escape') {
    const ticketSection = document.getElementById('ticket-section');
    if (ticketSection.style.display !== 'none') {
      document.getElementById('generate-new-btn').click();
    }
  }
});

// Handle form submission with Enter key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
    const form = e.target.closest('form');
    if (form && form.id === 'ticket-form') {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  }
});
