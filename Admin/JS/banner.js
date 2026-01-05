// Load the latest banner image
function loadLatestBanner() {
  fetch('/Images/Banners/get_banner.php')
    .then(res => res.json())
    .then(data => {
      if (data.file) {
        const bannerImg = document.getElementById('bannerImage');
        if (bannerImg) bannerImg.src = data.file;
      }
    })
    .catch(err => console.error('Banner fetch error:', err));
}

// Upload banner (admin only)
function uploadBannerImage() {
  const fileInput = document.getElementById('bannerUpload');
  const file = fileInput?.files?.[0];
  if (!file) {
    alert('Please select a file first');
    return;
  }

  // ✅ File size limit — 2MB
  const maxSize = 2 * 1024 * 1024; // bytes
  if (file.size > maxSize) {
    alert('File is too large! Maximum allowed size is 2MB.');
    fileInput.value = '';
    return;
  }

  // ✅ Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Only JPG and PNG are allowed.');
    fileInput.value = '';
    return;
  }

  const formData = new FormData();
  formData.append('banner', file);

  fetch('/Admin/Php/upload_banner.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Banner uploaded successfully!');
        window.location.reload();
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(err => console.error('Upload error:', err));
}

// Delete banner
async function deleteBanner() {
  const bannerImg = document.getElementById('bannerImage');
  const src = bannerImg?.src;

  if (!src || src.includes('placeholder.com')) {
    alert('No banner to delete.');
    return;
  }

  if (!confirm('Are you sure you want to delete this banner?')) return;

  try {
    const res = await fetch('/Admin/Php/delete_banner.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: src })
    });
    const data = await res.json();

    if (data.success) {
      alert('Banner deleted successfully!');
      window.location.reload();
    } else {
      alert('Failed to delete: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error('Delete banner error:', err);
    alert('Error deleting banner.');
  }
}

// Attach events
document.addEventListener('DOMContentLoaded', () => {
  loadLatestBanner();

  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) uploadBtn.addEventListener('click', uploadBannerImage);

  const deleteBannerBtn = document.getElementById('deleteBannerBtn');
  if (deleteBannerBtn) deleteBannerBtn.addEventListener('click', deleteBanner);
});
