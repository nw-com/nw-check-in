// 打卡功能相關函數

// 更新狀態顯示
function updateStatusDisplay() {
    const statusText = document.getElementById('status-text');
    if (!statusText) {
        // 創建狀態顯示區域
        const clockInContainer = document.querySelector('.clock-in-container');
        if (clockInContainer) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'status-display';
            statusDiv.className = 'text-center py-2 font-semibold text-lg rounded-lg mb-4';
            
            const statusTextSpan = document.createElement('span');
            statusTextSpan.id = 'status-text';
            statusTextSpan.textContent = '尚未打卡';
            statusTextSpan.className = 'text-gray-700';
            
            statusDiv.appendChild(statusTextSpan);
            statusDiv.style.backgroundColor = '#f3f4f6'; // gray-100
            
            // 插入到按鈕區域之前
            const buttonContainer = document.querySelector('.clock-in-buttons');
            if (buttonContainer) {
                clockInContainer.insertBefore(statusDiv, buttonContainer);
            } else {
                clockInContainer.appendChild(statusDiv);
            }
        }
        return;
    }
    
    // 根據當前狀態更新顯示
    switch (state.clockInStatus) {
        case '上班':
            statusText.textContent = '在辦公室';
            statusText.className = 'text-green-600';
            break;
        case '下班':
            statusText.textContent = '已下班';
            statusText.className = 'text-gray-600';
            break;
        case '外出':
            statusText.textContent = `外出中 ${state.outboundLocation ? '- ' + state.outboundLocation : ''}`;
            statusText.className = 'text-blue-600';
            break;
        case '抵達':
            statusText.textContent = `抵達 ${state.outboundLocation ? state.outboundLocation : ''}`;
            statusText.className = 'text-purple-600';
            break;
        case '離開':
            statusText.textContent = `離開 ${state.outboundLocation ? state.outboundLocation : ''}`;
            statusText.className = 'text-yellow-600';
            break;
        case '返回':
            statusText.textContent = '返回辦公室';
            statusText.className = 'text-teal-600';
            break;
        default:
            statusText.textContent = '尚未打卡';
            statusText.className = 'text-gray-700';
    }
}

function initClockInButtonStatus() {
    // 獲取用戶最後的打卡狀態
    const userRef = doc(db, "users", state.currentUser.uid);
    getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            state.clockInStatus = userData.status || 'none';
            state.outboundLocation = userData.outboundLocation || null;
            
            // 根據狀態啟用/禁用按鈕
            updateButtonStatus();
            
            // 更新狀態顯示
            updateStatusDisplay();
        } else {
            // 用戶資料不存在，設置默認狀態
            state.clockInStatus = 'none';
            state.outboundLocation = null;
            updateButtonStatus();
            updateStatusDisplay();
        }
    }).catch(error => {
        console.error("獲取用戶狀態失敗:", error);
        showToast("獲取用戶狀態失敗", "error");
    });
}

// 根據當前狀態更新按鈕狀態
function updateButtonStatus() {
    // 先禁用所有按鈕
    document.querySelectorAll('.clock-in-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-purple-600', 'bg-pink-600');
        btn.classList.add('bg-gray-400');
    });
    
    // 根據狀態啟用相應按鈕
    switch (state.clockInStatus) {
        case 'none': // 尚未打卡
            enableOnlyButton('上班');
            break;
        case '上班': // 在辦公室
            enableButton('下班');
            enableButton('外出');
            enableButton('臨時請假');
            enableButton('特殊勤務');
            
            // 設置上班打卡按鈕顏色
            const clockInBtn = document.querySelector('.clock-in-btn[data-type="上班"]');
            if (clockInBtn) {
                clockInBtn.classList.remove('bg-gray-400');
                clockInBtn.classList.add('bg-green-600');
            }
            break;
        case '下班': // 已下班
            enableOnlyButton('上班');
            
            // 設置下班打卡按鈕顏色
            const clockOutBtn = document.querySelector('.clock-in-btn[data-type="下班"]');
            if (clockOutBtn) {
                clockOutBtn.classList.remove('bg-gray-400');
                clockOutBtn.classList.add('bg-blue-600');
            }
            break;
        case '外出': // 外出中
            enableOnlyButton('抵達');
            
            // 設置外出打卡按鈕顏色
            const outBtn = document.querySelector('.clock-in-btn[data-type="外出"]');
            if (outBtn) {
                outBtn.classList.remove('bg-gray-400');
                outBtn.classList.add('bg-yellow-600');
            }
            break;
        case '抵達': // 抵達外出地點
            enableOnlyButton('離開');
            
            // 設置抵達打卡按鈕顏色
            const arriveBtn = document.querySelector('.clock-in-btn[data-type="抵達"]');
            if (arriveBtn) {
                arriveBtn.classList.remove('bg-gray-400');
                arriveBtn.classList.add('bg-purple-600');
            }
            break;
        case '離開': // 離開外出地點
            enableOnlyButton('外出');
            
            // 設置離開打卡按鈕顏色
            const leaveBtn = document.querySelector('.clock-in-btn[data-type="離開"]');
            if (leaveBtn) {
                leaveBtn.classList.remove('bg-gray-400');
                leaveBtn.classList.add('bg-pink-600');
            }
            break;
        case '返回': // 返回辦公室
            enableButton('下班');
            enableButton('外出');
            enableButton('臨時請假');
            enableButton('特殊勤務');
            
            // 設置返回打卡按鈕顏色
            const returnBtn = document.querySelector('.clock-in-btn[data-type="返回"]');
            if (returnBtn) {
                returnBtn.classList.remove('bg-gray-400');
                returnBtn.classList.add('bg-green-600');
            }
            break;
    }
}

// 啟用指定按鈕
function enableButton(type) {
    const button = document.querySelector(`.clock-in-btn[data-type="${type}"]`);
    if (button) {
        button.disabled = false;
        button.classList.remove('bg-gray-400');
        button.classList.add('bg-red-600');
    }
}

// 只啟用指定按鈕
function enableOnlyButton(type) {
    document.querySelectorAll('.clock-in-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-purple-600', 'bg-pink-600');
        btn.classList.add('bg-gray-400');
    });
    
    const button = document.querySelector(`.clock-in-btn[data-type="${type}"]`);
    if (button) {
        button.disabled = false;
        button.classList.remove('bg-gray-400');
        button.classList.add('bg-red-600');
    }
}

// 外出地點輸入彈窗
function openLocationInputModal() {
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop flex items-center justify-center';
    modal.id = 'location-input-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content p-6 max-w-md';
    
    modalContent.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">請輸入外出地點</h3>
        <input type="text" id="outbound-location" class="w-full p-2 border rounded mb-4" placeholder="請輸入外出地點">
        <div class="flex justify-end space-x-2">
            <button id="cancel-location" class="px-4 py-2 bg-gray-300 rounded">取消</button>
            <button id="confirm-location" class="px-4 py-2 bg-red-600 text-white rounded">確認</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 聚焦輸入框
    setTimeout(() => {
        document.getElementById('outbound-location').focus();
    }, 100);
    
    // 綁定事件
    document.getElementById('cancel-location').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('confirm-location').addEventListener('click', () => {
        const location = document.getElementById('outbound-location').value.trim();
        if (!location) {
            showToast('請輸入外出地點', 'error');
            return;
        }
        
        // 保存外出地點
        state.outboundLocation = location;
        
        // 關閉模態框
        document.body.removeChild(modal);
        
        // 打開相機模態框
        openCameraModal('外出', location);
    });
}

// 臨時請假彈窗
function openTempLeaveModal() {
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop flex items-center justify-center';
    modal.id = 'temp-leave-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content p-6 max-w-md';
    
    modalContent.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">臨時請假</h3>
        <div class="mb-4">
            <label class="block mb-2">請假事由</label>
            <select id="leave-reason" class="w-full p-2 border rounded">
                <option value="">請選擇請假事由</option>
                <option value="病假">病假</option>
                <option value="事假">事假</option>
                <option value="其他">其他</option>
            </select>
            <div id="other-reason-container" class="mt-2 hidden">
                <input type="text" id="other-reason" class="w-full p-2 border rounded" placeholder="請輸入其他事由">
            </div>
        </div>
        <div class="mb-4">
            <label class="block mb-2">請假時間</label>
            <div class="flex space-x-2">
                <input type="datetime-local" id="leave-start-time" class="flex-1 p-2 border rounded">
                <span class="self-center">至</span>
                <input type="datetime-local" id="leave-end-time" class="flex-1 p-2 border rounded">
            </div>
        </div>
        <div class="flex justify-end space-x-2">
            <button id="cancel-leave" class="px-4 py-2 bg-gray-300 rounded">取消</button>
            <button id="confirm-leave" class="px-4 py-2 bg-red-600 text-white rounded">確認</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 設置默認時間
    const now = new Date();
    const startTime = new Date(now);
    const endTime = new Date(now);
    endTime.setHours(endTime.getHours() + 2); // 默認請假2小時
    
    document.getElementById('leave-start-time').value = formatDatetimeLocal(startTime);
    document.getElementById('leave-end-time').value = formatDatetimeLocal(endTime);
    
    // 綁定事件
    document.getElementById('leave-reason').addEventListener('change', (e) => {
        const otherContainer = document.getElementById('other-reason-container');
        if (e.target.value === '其他') {
            otherContainer.classList.remove('hidden');
        } else {
            otherContainer.classList.add('hidden');
        }
    });
    
    document.getElementById('cancel-leave').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('confirm-leave').addEventListener('click', () => {
        const reasonSelect = document.getElementById('leave-reason');
        let reason = reasonSelect.value;
        
        if (!reason) {
            showToast('請選擇請假事由', 'error');
            return;
        }
        
        if (reason === '其他') {
            const otherReason = document.getElementById('other-reason').value.trim();
            if (!otherReason) {
                showToast('請輸入其他事由', 'error');
                return;
            }
            reason = otherReason;
        }
        
        const startTime = document.getElementById('leave-start-time').value;
        const endTime = document.getElementById('leave-end-time').value;
        
        if (!startTime || !endTime) {
            showToast('請選擇請假時間', 'error');
            return;
        }
        
        if (new Date(startTime) >= new Date(endTime)) {
            showToast('結束時間必須晚於開始時間', 'error');
            return;
        }
        
        // 保存臨時請假記錄
        saveLeaveRecord(reason, startTime, endTime);
        
        // 關閉模態框
        document.body.removeChild(modal);
    });
}

// 特殊勤務彈窗
function openSpecialDutyModal() {
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop flex items-center justify-center';
    modal.id = 'special-duty-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content p-6 max-w-md';
    
    modalContent.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">特殊勤務</h3>
        <div class="mb-4">
            <label class="block mb-2">勤務事項</label>
            <select id="duty-type" class="w-full p-2 border rounded">
                <option value="">請選擇勤務事項</option>
                <option value="簡報">簡報</option>
                <option value="例會">例會</option>
                <option value="區大">區大</option>
                <option value="臨時會">臨時會</option>
                <option value="其他活動">其他活動</option>
                <option value="其他">其他</option>
            </select>
            <div id="other-duty-container" class="mt-2 hidden">
                <input type="text" id="other-duty" class="w-full p-2 border rounded" placeholder="請輸入其他勤務事項">
            </div>
        </div>
        <div class="flex justify-end space-x-2">
            <button id="cancel-duty" class="px-4 py-2 bg-gray-300 rounded">取消</button>
            <button id="confirm-duty" class="px-4 py-2 bg-red-600 text-white rounded">確認</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 綁定事件
    document.getElementById('duty-type').addEventListener('change', (e) => {
        const otherContainer = document.getElementById('other-duty-container');
        if (e.target.value === '其他') {
            otherContainer.classList.remove('hidden');
        } else {
            otherContainer.classList.add('hidden');
        }
    });
    
    document.getElementById('cancel-duty').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('confirm-duty').addEventListener('click', () => {
        const dutySelect = document.getElementById('duty-type');
        let duty = dutySelect.value;
        
        if (!duty) {
            showToast('請選擇勤務事項', 'error');
            return;
        }
        
        if (duty === '其他') {
            const otherDuty = document.getElementById('other-duty').value.trim();
            if (!otherDuty) {
                showToast('請輸入其他勤務事項', 'error');
                return;
            }
            duty = otherDuty;
        }
        
        // 保存特殊勤務記錄
        saveDutyRecord(duty);
        
        // 關閉模態框
        document.body.removeChild(modal);
    });
}

// 保存臨時請假記錄
async function saveLeaveRecord(reason, startTime, endTime) {
    try {
        const auth = firebase.auth().currentUser;
        if (!auth) {
            showToast('請先登入', 'error');
            return;
        }
        
        const userId = auth.uid;
        const db = firebase.firestore();
        
        // 保存請假記錄
        await addDoc(collection(db, 'leave_records'), {
            userId,
            reason,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            timestamp: serverTimestamp()
        });
        
        showToast('臨時請假申請已提交', 'success');
    } catch (error) {
        console.error('保存臨時請假記錄失敗:', error);
        showToast('臨時請假申請失敗', 'error');
    }
}

// 保存特殊勤務記錄
async function saveDutyRecord(duty) {
    try {
        const auth = firebase.auth().currentUser;
        if (!auth) {
            showToast('請先登入', 'error');
            return;
        }
        
        const userId = auth.uid;
        const db = firebase.firestore();
        
        // 保存特殊勤務記錄
        await addDoc(collection(db, 'duty_records'), {
            userId,
            duty,
            timestamp: serverTimestamp()
        });
        
        showToast('特殊勤務已登記', 'success');
    } catch (error) {
        console.error('保存特殊勤務記錄失敗:', error);
        showToast('特殊勤務登記失敗', 'error');
    }
}

// 格式化日期時間為datetime-local格式
function formatDatetimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 初始化事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化打卡按鈕狀態
    setTimeout(() => {
        initClockInButtonStatus();
    }, 1000); // 延遲1秒，確保Firebase已初始化
    
    // 綁定打卡按鈕事件
    document.addEventListener('click', (e) => {
        // 外出打卡按鈕
        if (e.target.matches('.clock-in-btn[data-type="外出"]') && !e.target.disabled) {
            e.preventDefault();
            openLocationInputModal();
        }
        
        // 臨時請假按鈕
        if (e.target.matches('.clock-in-btn[data-type="臨時請假"]') && !e.target.disabled) {
            e.preventDefault();
            openTempLeaveModal();
        }
        
        // 特殊勤務按鈕
        if (e.target.matches('.clock-in-btn[data-type="特殊勤務"]') && !e.target.disabled) {
            e.preventDefault();
            openSpecialDutyModal();
        }
    });
});
        } else {
            // 新用戶，只啟用上班打卡
            enableOnlyButton('上班');
        }
    }).catch(error => {
        console.error("獲取用戶狀態失敗:", error);
        showToast("獲取用戶狀態失敗，請重新整理頁面", true);
    });
}

function updateButtonStatus() {
    // 禁用所有按鈕
    document.querySelectorAll('.clock-in-btn').forEach(btn => {
        btn.classList.add('disabled', 'bg-gray-500');
        btn.classList.remove('bg-green-500', 'bg-blue-600', 'bg-teal-600', 'bg-purple-600', 'bg-yellow-600');
    });
    
    // 根據當前狀態啟用相應按鈕
    switch (state.clockInStatus) {
        case '上班':
            // 上班狀態下，可以下班打卡和外出打卡
            enableButton('下班', 'bg-gray-600');
            enableButton('外出', 'bg-blue-600');
            break;
        case '下班':
            // 下班狀態下，只能上班打卡
            enableButton('上班', 'bg-green-600');
            break;
        case '外出':
            // 外出狀態下，可以抵達打卡
            enableButton('抵達', 'bg-purple-600');
            break;
        case '抵達':
            // 抵達狀態下，可以離開打卡
            enableButton('離開', 'bg-yellow-600');
            break;
        case '離開':
            // 離開狀態下，可以外出打卡
            enableButton('外出', 'bg-blue-600');
            break;
        case '返回':
            // 返回狀態下，可以下班打卡和外出打卡
            enableButton('下班', 'bg-gray-600');
            enableButton('外出', 'bg-blue-600');
            break;
        default:
            // 默認狀態，只能上班打卡
            enableButton('上班', 'bg-green-600');
    }
}

function enableButton(type, bgClass) {
    const btn = document.querySelector(`.clock-in-btn[data-type="${type}"]`);
    if (btn) {
        btn.classList.remove('disabled', 'bg-gray-500');
        btn.classList.add(bgClass);
    }
}

function enableOnlyButton(type) {
    document.querySelectorAll('.clock-in-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.remove('disabled', 'bg-gray-500');
            btn.classList.add('bg-green-500');
        } else {
            btn.classList.add('disabled', 'bg-gray-500');
        }
    });
}

function openLocationInputModal(type, location) {
    const modalId = `location-input-modal-${Date.now()}`;
    
    const modalHTML = `
        <div id="${modalId}" class="modal-backdrop">
            <div class="modal-content w-[90%] max-w-[400px] bg-white rounded-lg shadow-xl">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-lg">請輸入外出地點</h3>
                </div>
                <div class="p-4">
                    <input type="text" id="outbound-location" class="w-full border border-gray-300 rounded-md px-3 py-2 mb-4" placeholder="請輸入外出地點">
                    <div class="flex justify-end space-x-2">
                        <button class="cancel-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">取消</button>
                        <button class="confirm-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">確認</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById(modalId);
    
    // 取消按鈕
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // 確認按鈕
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        const locationInput = document.getElementById('outbound-location');
        const outboundLocation = locationInput.value.trim();
        
        if (!outboundLocation) {
            showToast("請輸入外出地點", true);
            return;
        }
        
        // 保存外出地點
        state.outboundLocation = outboundLocation;
        
        // 關閉模態窗
        modal.remove();
        
        // 打開相機模態窗
        openCameraModal(type, location);
    });
}

function openTempLeaveModal() {
    const modalId = `temp-leave-modal-${Date.now()}`;
    
    const modalHTML = `
        <div id="${modalId}" class="modal-backdrop">
            <div class="modal-content w-[90%] max-w-[400px] bg-white rounded-lg shadow-xl">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-lg">臨時請假</h3>
                </div>
                <div class="p-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">請假事由</label>
                        <select id="leave-reason" class="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="">請選擇請假事由</option>
                            <option value="病假">病假</option>
                            <option value="事假">事假</option>
                            <option value="其他">其他</option>
                        </select>
                        <div id="other-reason-container" class="mt-2 hidden">
                            <input type="text" id="other-reason" class="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="請輸入請假事由">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">請假時間</label>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-xs text-gray-500">從</label>
                                <input type="datetime-local" id="leave-start" class="w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500">至</label>
                                <input type="datetime-local" id="leave-end" class="w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-2">
                        <button class="cancel-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">取消</button>
                        <button class="confirm-btn px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">確認請假</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById(modalId);
    
    // 其他事由顯示/隱藏
    const reasonSelect = document.getElementById('leave-reason');
    const otherReasonContainer = document.getElementById('other-reason-container');
    
    reasonSelect.addEventListener('change', () => {
        if (reasonSelect.value === '其他') {
            otherReasonContainer.classList.remove('hidden');
        } else {
            otherReasonContainer.classList.add('hidden');
        }
    });
    
    // 取消按鈕
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // 確認按鈕
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        const reason = reasonSelect.value;
        const otherReason = document.getElementById('other-reason')?.value;
        const startTime = document.getElementById('leave-start').value;
        const endTime = document.getElementById('leave-end').value;
        
        // 驗證輸入
        if (!reason) {
            showToast("請選擇請假事由", true);
            return;
        }
        
        if (reason === '其他' && !otherReason) {
            showToast("請輸入請假事由", true);
            return;
        }
        
        if (!startTime || !endTime) {
            showToast("請選擇請假時間", true);
            return;
        }
        
        // 這裡可以添加保存請假記錄的邏輯
        showToast("請假申請已提交");
        
        // 關閉模態窗
        modal.remove();
    });
}

function openSpecialDutyModal() {
    const modalId = `special-duty-modal-${Date.now()}`;
    
    const modalHTML = `
        <div id="${modalId}" class="modal-backdrop">
            <div class="modal-content w-[90%] max-w-[400px] bg-white rounded-lg shadow-xl">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-lg">特殊勤務</h3>
                </div>
                <div class="p-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">勤務事項</label>
                        <select id="duty-type" class="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="">請選擇勤務事項</option>
                            <option value="簡報">簡報</option>
                            <option value="例會">例會</option>
                            <option value="區大">區大</option>
                            <option value="臨時會">臨時會</option>
                            <option value="其他活動">其他活動</option>
                            <option value="其他">其他</option>
                        </select>
                        <div id="other-duty-container" class="mt-2 hidden">
                            <input type="text" id="other-duty" class="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="請輸入勤務事項">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 pt-2">
                        <button class="cancel-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">取消</button>
                        <button class="confirm-btn px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">確認</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById(modalId);
    
    // 其他事項顯示/隱藏
    const dutySelect = document.getElementById('duty-type');
    const otherDutyContainer = document.getElementById('other-duty-container');
    
    dutySelect.addEventListener('change', () => {
        if (dutySelect.value === '其他') {
            otherDutyContainer.classList.remove('hidden');
        } else {
            otherDutyContainer.classList.add('hidden');
        }
    });
    
    // 取消按鈕
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // 確認按鈕
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        const dutyType = dutySelect.value;
        const otherDuty = document.getElementById('other-duty')?.value;
        
        // 驗證輸入
        if (!dutyType) {
            showToast("請選擇勤務事項", true);
            return;
        }
        
        if (dutyType === '其他' && !otherDuty) {
            showToast("請輸入勤務事項", true);
            return;
        }
        
        // 這裡可以添加保存特殊勤務記錄的邏輯
        showToast("特殊勤務已記錄");
        
        // 關閉模態窗
        modal.remove();
    });
}

// 在保存打卡記錄後更新用戶狀態和按鈕狀態
async function saveClockInRecord(type, location, photoUrl, description) {
    try {
        showLoading(true);
        
        // 保存打卡記錄
        const recordData = {
            userId: state.currentUser.uid,
            userName: state.currentUser.displayName,
            type: type,
            timestamp: serverTimestamp(),
            location: location,
            photoUrl: photoUrl,
            description: description || ''
        };
        
        // 如果是外出打卡，添加外出地點
        if (type === '外出') {
            recordData.outboundLocation = state.outboundLocation;
        }
        
        // 添加記錄到 Firestore
        await addDoc(collection(db, "clockInRecords"), recordData);
        
        // 更新用戶狀態
        const userRef = doc(db, "users", state.currentUser.uid);
        const userData = {
            status: type,
            lastClockInTime: serverTimestamp()
        };
        
        // 如果是外出打卡，保存外出地點
        if (type === '外出') {
            userData.outboundLocation = state.outboundLocation;
        } else if (type === '返回') {
            // 返回時清除外出地點
            userData.outboundLocation = null;
        }
        
        await updateDoc(userRef, userData);
        
        // 更新本地狀態
        state.clockInStatus = type;
        
        // 更新按鈕狀態
        updateButtonStatus();
        
        // 更新狀態顯示
        updateStatusDisplay();
        
        showToast("打卡成功");
    } catch (error) {
        console.error("打卡失敗:", error);
        showToast("打卡失敗，請稍後再試", true);
    } finally {
        showLoading(false);
    }
}