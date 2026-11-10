/* =========================
   FR-36 · Duyệt hồ sơ (fixed close button)
   ========================= */

const mockData = [
    {
        id: 1,
        name: "Nguyễn Văn An",
        phone: "0901 234 567",
        email: "nguyenvanan@gmail.com",
        idNumber: "001234567890",
        type: "Chủ xe / Đối tác",
        date: "08/11/2026 14:32",
        status: "pending",
        docs: [
            { label: "CCCD mặt trước", url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" },
            { label: "CCCD mặt sau", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" },
            { label: "GPLX mặt trước", url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80" },
            { label: "GPLX mặt sau", url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&q=80" }
        ]
    },
    {
        id: 2,
        name: "Trần Thị Bình",
        phone: "0912 345 678",
        email: "tranthibinh@gmail.com",
        idNumber: "001098765432",
        type: "Khách thuê xe",
        date: "08/11/2026 09:15",
        status: "pending",
        docs: [
            { label: "CCCD mặt trước", url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" },
            { label: "CCCD mặt sau", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" }
        ]
    },
    {
        id: 3,
        name: "Lê Minh Cường",
        phone: "0987 654 321",
        email: "leminhcuong@gmail.com",
        idNumber: "079203456789",
        type: "Chủ xe / Đối tác",
        date: "07/11/2026 16:40",
        status: "pending",
        docs: [
            { label: "CCCD mặt trước", url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" },
            { label: "CCCD mặt sau", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" },
            { label: "Đăng ký xe", url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80" }
        ]
    },
    {
        id: 4,
        name: "Phạm Thu Hà",
        phone: "0933 221 100",
        email: "phamthuha@gmail.com",
        idNumber: "001122334455",
        type: "Khách thuê xe",
        date: "06/11/2026 11:05",
        status: "approved",
        docs: [
            { label: "CCCD mặt trước", url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" },
            { label: "CCCD mặt sau", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" }
        ]
    },
    {
        id: 5,
        name: "Hoàng Đức Khoa",
        phone: "0977 888 999",
        email: "hoangduckhoa@gmail.com",
        idNumber: "036123456789",
        type: "Chủ xe / Đối tác",
        date: "05/11/2026 08:50",
        status: "rejected",
        docs: [
            { label: "CCCD mặt trước", url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" },
            { label: "CCCD mặt sau", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" }
        ],
        rejectReason: "Ảnh giấy tờ mờ, không rõ thông tin."
    }
];

let data = [...mockData];
let currentId = null;
let rejectMode = false;

const tableBody = document.getElementById("table-body");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const modal = document.getElementById("modal");
const rejectBox = document.getElementById("reject-box");
const rejectReason = document.getElementById("reject-reason");
const rejectError = document.getElementById("reject-error");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const toast = document.getElementById("toast");
const modalActions = document.getElementById("modal-actions");

function getInitials(name) {
    return name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
}

function statusBadge(status) {
    const map = {
        pending:  { cls: "badge-pending",  text: "Chờ duyệt" },
        approved: { cls: "badge-approved", text: "Đã duyệt" },
        rejected: { cls: "badge-rejected", text: "Từ chối" }
    };
    const s = map[status] || map.pending;
    return `<span class="badge ${s.cls}">${s.text}</span>`;
}

function updateCounts() {
    document.getElementById("count-pending").textContent  = data.filter(d => d.status === "pending").length;
    document.getElementById("count-approved").textContent = data.filter(d => d.status === "approved").length;
    document.getElementById("count-rejected").textContent = data.filter(d => d.status === "rejected").length;
}

function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2800);
}

function renderTable() {
    const keyword = searchInput.value.trim().toLowerCase();
    const status = filterStatus.value;

    const filtered = data.filter(item => {
        const matchStatus = status === "all" || item.status === status;
        const matchKeyword =
            !keyword ||
            item.name.toLowerCase().includes(keyword) ||
            item.phone.replace(/\s/g, "").includes(keyword.replace(/\s/g, "")) ||
            item.idNumber.includes(keyword) ||
            item.email.toLowerCase().includes(keyword);
        return matchStatus && matchKeyword;
    });

    tableBody.innerHTML = "";
    emptyState.hidden = filtered.length > 0;

    filtered.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${getInitials(item.name)}</div>
                    <div class="user-info">
                        <strong>${item.name}</strong>
                        <span>${item.phone}</span>
                    </div>
                </div>
            </td>
            <td>${item.type}</td>
            <td>
                <div class="doc-thumbs">
                    ${item.docs.slice(0, 3).map(d =>
                        `<img src="${d.url}" alt="${d.label}" data-full="${d.url}" title="${d.label}">`
                    ).join("")}
                    ${item.docs.length > 3 ? `<span style="font-size:12px;color:#718096;align-self:center">+${item.docs.length - 3}</span>` : ""}
                </div>
            </td>
            <td>${item.date}</td>
            <td>${statusBadge(item.status)}</td>
            <td>
                <button type="button" class="btn-action" data-id="${item.id}">Xem & duyệt</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll(".doc-thumbs img").forEach(img => {
        img.addEventListener("click", e => {
            e.stopPropagation();
            openLightbox(img.dataset.full);
        });
    });

    tableBody.querySelectorAll(".btn-action").forEach(btn => {
        btn.addEventListener("click", () => openModal(Number(btn.dataset.id)));
    });

    updateCounts();
}

function openModal(id) {
    const item = data.find(d => d.id === id);
    if (!item) {
        console.warn("Không tìm thấy hồ sơ id =", id);
        return;
    }

    currentId = id;
    rejectMode = false;
    rejectBox.hidden = true;
    rejectReason.value = "";
    rejectReason.disabled = false;
    rejectError.hidden = true;

    document.getElementById("d-name").textContent   = item.name;
    document.getElementById("d-phone").textContent  = item.phone;
    document.getElementById("d-email").textContent  = item.email;
    document.getElementById("d-id").textContent     = item.idNumber;
    document.getElementById("d-type").textContent   = item.type;
    document.getElementById("d-date").textContent   = item.date;
    document.getElementById("d-status").innerHTML   = statusBadge(item.status);

    const gallery = document.getElementById("doc-gallery");
    gallery.innerHTML = item.docs.map(d => `
        <div class="doc-card">
            <img src="${d.url}" alt="${d.label}" data-full="${d.url}">
            <div class="doc-label">${d.label}</div>
        </div>
    `).join("");

    gallery.querySelectorAll("img").forEach(img => {
        img.addEventListener("click", () => openLightbox(img.dataset.full));
    });

    // Render footer buttons theo trạng thái
    if (item.status === "pending") {
        modalActions.innerHTML = `
            <button type="button" class="btn btn-ghost" data-action="close">Đóng</button>
            <button type="button" class="btn btn-danger" data-action="reject">Từ chối</button>
            <button type="button" class="btn btn-success" data-action="approve">Duyệt hồ sơ</button>
        `;
    } else {
        modalActions.innerHTML = `
            <button type="button" class="btn btn-ghost" data-action="close">Đóng</button>
        `;
        if (item.status === "rejected" && item.rejectReason) {
            rejectBox.hidden = false;
            rejectReason.value = item.rejectReason;
            rejectReason.disabled = true;
        }
    }

    modal.hidden = false;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.hidden = true;
    modal.style.display = "none";
    document.body.style.overflow = "";
    currentId = null;
    rejectMode = false;
    rejectReason.disabled = false;
    rejectBox.hidden = true;
    rejectError.hidden = true;
}

function startReject() {
    rejectMode = true;
    rejectBox.hidden = false;
    rejectReason.disabled = false;
    rejectReason.focus();

    // Đổi nút Từ chối thành Xác nhận từ chối
    const rejectBtn = modalActions.querySelector('[data-action="reject"]');
    if (rejectBtn) {
        rejectBtn.classList.add("confirm");
        rejectBtn.textContent = "Xác nhận từ chối";
        rejectBtn.dataset.action = "confirm-reject";
    }
}

function confirmReject() {
    const reason = rejectReason.value.trim();
    if (!reason) {
        rejectError.hidden = false;
        rejectReason.focus();
        return;
    }
    rejectError.hidden = true;

    const item = data.find(d => d.id === currentId);
    if (item) {
        item.status = "rejected";
        item.rejectReason = reason;
    }

    closeModal();
    renderTable();
    showToast("Đã từ chối hồ sơ.");
}

function approve() {
    const item = data.find(d => d.id === currentId);
    if (item) {
        item.status = "approved";
        delete item.rejectReason;
    }
    closeModal();
    renderTable();
    showToast("Đã duyệt hồ sơ thành công.");
}

function openLightbox(url) {
    lightboxImg.src = url;
    lightbox.hidden = false;
    lightbox.style.display = "flex";
}

function closeLightbox() {
    lightbox.hidden = true;
    lightbox.style.display = "none";
    lightboxImg.src = "";
}

/* ===== Event: nút trong modal (delegation – luôn hoạt động) ===== */
modalActions.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "close") {
        closeModal();
    } else if (action === "reject") {
        startReject();
    } else if (action === "confirm-reject") {
        confirmReject();
    } else if (action === "approve") {
        approve();
    }
});

/* Nút X trên header modal */
document.getElementById("btn-close-modal").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
});

/* Click nền ngoài modal để đóng */
modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
});

/* Lightbox */
document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
});

/* Search + filter */
searchInput.addEventListener("input", renderTable);
filterStatus.addEventListener("change", renderTable);

/* Phím Escape */
document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!lightbox.hidden) {
        closeLightbox();
    } else if (!modal.hidden) {
        closeModal();
    }
});

/* Init */
renderTable();
