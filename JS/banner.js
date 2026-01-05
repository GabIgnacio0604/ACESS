let banners = [];
let current = 0;

async function loadBanners() {
  try {
    const res = await fetch('../Images/Banners/get_banner.php');
    const data = await res.json();

    if (data.success && data.banners.length > 0) {
      banners = data.banners;
      document.getElementById('bannerImage').src = banners[current];
      updateArrows();
    }
  } catch (err) {
    console.error('Error loading banners:', err);
  }
}

function updateArrows() {
  const prev = document.getElementById('bannerPrev');
  const next = document.getElementById('bannerNext');
  if (banners.length <= 1) {
    prev.style.display = 'none';
    next.style.display = 'none';
  } else {
    prev.style.display = 'inline-block';
    next.style.display = 'inline-block';
  }
}

document.getElementById('bannerPrev').addEventListener('click', () => {
  if (banners.length > 1) {
    current = (current - 1 + banners.length) % banners.length;
    document.getElementById('bannerImage').src = banners[current];
  }
});

document.getElementById('bannerNext').addEventListener('click', () => {
  if (banners.length > 1) {
    current = (current + 1) % banners.length;
    document.getElementById('bannerImage').src = banners[current];
  }
});

document.getElementById('uploadBtn')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('bannerUpload');
  if (!fileInput.files.length) {
    alert('Please select a file first!');
    return;
  }

  const formData = new FormData();
  formData.append('banner', fileInput.files[0]);

  const res = await fetch('/Admin/Php/upload_banner.php', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();

  if (data.success) {
    alert('Banner uploaded successfully!');
    loadBanners();
  } else {
    alert('Upload failed: ' + data.error);
  }
});

document.addEventListener('DOMContentLoaded', loadBanners);
