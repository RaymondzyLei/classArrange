// 应用类
class CourseGroupApp {
    constructor() {
        // 弹窗版本号，用于控制是否显示最新版本的弹窗
        this.WELCOME_MODAL_VERSION = '1.0.5';
        // 初始化DOM元素
        this.searchResultsContainer = document.getElementById('search-results');
        this.selectedGroupsContainer = document.getElementById('selected-groups');
        this.courseNumberInput = document.getElementById('course-number');
        this.courseNameInput = document.getElementById('course-name');
        this.groupIdInput = document.getElementById('group-id');
        this.searchBtn = document.getElementById('search-btn');
        this.clearBtn = document.getElementById('clear-btn');
        // 初始化弹窗元素
        this.modal = document.getElementById('group-details-modal');
        this.closeBtn = document.querySelector('.close');
        this.modalCourseName = document.getElementById('modal-course-name');
        this.modalCourseInfo = document.getElementById('modal-course-info');
        // 初始化欢迎弹窗元素
        this.welcomeModal = document.getElementById('welcome-modal');
        this.welcomeBtnOk = document.getElementById('welcome-btn-ok');
        this.welcomeBtnDisable = document.getElementById('welcome-btn-disable');
        // 初始化已选课程组ID集合
        this.selectedGroupIds = this.loadSelectedGroupsFromStorage();
        // 初始化搜索结果
        this.searchResults = [];
        // 绑定事件
        this.bindEvents();
        // 初始化应用
        this.init();
    }
    bindEvents() {
        // 搜索按钮事件
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        // 清除按钮事件
        this.clearBtn.addEventListener('click', () => this.handleClear());
        // 回车键搜索
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        // 弹窗关闭事件
        this.closeBtn.addEventListener('click', () => this.closeModal());
        // 点击弹窗外部区域关闭弹窗
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        // 欢迎弹窗按钮事件
        this.welcomeBtnOk.addEventListener('click', () => this.closeWelcomeModal());
        this.welcomeBtnDisable.addEventListener('click', () => this.disableWelcomeModal());
    }
    init() {
        // 初始化应用
        this.updateSelectedGroupsDisplay();
        // 检查是否需要显示欢迎弹窗
        this.checkAndShowWelcomeModal();
    }
    /**
     * 检查是否需要显示欢迎弹窗
     */
    checkAndShowWelcomeModal() {
        const savedVersion = localStorage.getItem('welcomeModalVersion');
        const isDisabled = localStorage.getItem('welcomeModalDisabled');
        // 如果用户没有禁用弹窗，或者弹窗版本已更新，则显示
        if (!isDisabled || savedVersion !== this.WELCOME_MODAL_VERSION) {
            this.showWelcomeModal();
        }
    }
    /**
     * 显示欢迎弹窗
     */
    showWelcomeModal() {
        this.welcomeModal.style.display = 'block';
    }
    /**
     * 关闭欢迎弹窗
     */
    closeWelcomeModal() {
        this.welcomeModal.style.display = 'none';
        // 保存当前弹窗版本
        //localStorage.setItem('welcomeModalVersion', this.WELCOME_MODAL_VERSION);
    }
    /**
     * 禁用欢迎弹窗
     */
    disableWelcomeModal() {
        this.welcomeModal.style.display = 'none';
        // 保存禁用状态和当前版本
        localStorage.setItem('welcomeModalDisabled', 'true');
        localStorage.setItem('welcomeModalVersion', this.WELCOME_MODAL_VERSION);
    }
    // 从localStorage加载已选课程组
    loadSelectedGroupsFromStorage() {
        const stored = localStorage.getItem('selectedCourseGroups');
        if (stored) {
            try {
                return new Set(JSON.parse(stored).map(Number));
            }
            catch (e) {
                console.error('Failed to parse selected groups from localStorage:', e);
                return new Set();
            }
        }
        return new Set();
    }
    // 将已选课程组保存到localStorage
    saveSelectedGroupsToStorage() {
        localStorage.setItem('selectedCourseGroups', JSON.stringify(Array.from(this.selectedGroupIds)));
    }
    // 处理复选框变更
    handleCheckboxChange(groupId, isChecked) {
        if (isChecked) {
            this.selectedGroupIds.add(groupId);
        }
        else {
            this.selectedGroupIds.delete(groupId);
        }
        // 保存到localStorage
        this.saveSelectedGroupsToStorage();
        // 更新已选课程组显示
        this.updateSelectedGroupsDisplay();
    }
    // 更新已选课程组显示
    updateSelectedGroupsDisplay() {
        if (this.selectedGroupIds.size === 0) {
            this.selectedGroupsContainer.innerHTML = '<p class="no-selections">暂无选择的课程组</p>';
            return;
        }
        // 获取已选课程组的详细信息
        const selectedGroups = Array.from(this.selectedGroupIds)
            .map(id => groupInfo.find(group => group.class_number_group_id === id))
            .filter((group) => group !== undefined);
        // 渲染已选课程组
        this.selectedGroupsContainer.innerHTML = selectedGroups.map(group => `
            <div class="selected-group-item" data-group-id="${group.class_number_group_id}">
                <span class="group-info">
                    ${group.course_name} (ID: ${group.class_number_group_id})<br>
                    <small>课程编号: ${group.course_number} | 课堂编号: ${this.formatClassNumbers(group.class_numbers)}</small>
                </span>
                <button class="remove-btn" data-group-id="${group.class_number_group_id}">
                    ×
                </button>
            </div>
        `).join('');
        // 为已选课程组卡片添加点击事件
        this.selectedGroupsContainer.querySelectorAll('.selected-group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，不打开弹窗
                if (e.target.classList.contains('remove-btn')) {
                    return;
                }
                const groupId = parseInt(item.dataset.groupId);
                this.openGroupDetails(groupId);
            });
        });
        // 绑定删除按钮事件
        this.selectedGroupsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = parseInt(e.target.dataset.groupId);
                this.handleCheckboxChange(groupId, false);
                // 更新搜索结果中对应课程组的复选框状态
                const checkbox = document.querySelector(`input[type="checkbox"][data-group-id="${groupId}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                }
            });
        });
    }
    // 打开课程组详情弹窗
    openGroupDetails(groupId) {
        // 查找课程组信息
        const group = groupInfo.find(g => g.class_number_group_id === groupId);
        if (!group)
            return;
        // 设置弹窗标题和课程信息
        this.modalCourseName.textContent = `${group.course_name} (ID: ${group.class_number_group_id})`;
        this.modalCourseInfo.innerHTML = `
            <p><strong>课程编号:</strong> ${group.course_number}</p>
            <p><strong>课堂编号:</strong> ${this.formatClassNumbers(group.class_numbers)}</p>
            <p><strong>学分:</strong> ${group.credit}</p>
            <p><strong>考核方式:</strong> ${group.assessment_method}</p>
            <p><strong>周次:</strong> ${this.formatWeekInfo(group.parsed_time_location[0].week_info)}</p>
            <p><strong>校区:</strong> ${this.formatCampus(group.parsed_time_location[0].campus)}</p>
            <p><strong>时间:</strong> ${group.parsed_time_location.map(item => this.formatTimeSlots(item.time_slots)).join(' ')}</p>
            <div class="mini-schedule">
                <strong>课程表:</strong>
                <table class="mini-course-table">
                    ${this.generateMiniScheduleHTML(group)}
                </table>
            </div>
        `;
        // 显示弹窗
        this.modal.style.display = 'block';
    }
    // 关闭弹窗
    closeModal() {
        this.modal.style.display = 'none';
    }
    // 处理搜索
    handleSearch() {
        const courseNumber = this.courseNumberInput.value.trim();
        const courseName = this.courseNameInput.value.trim().toLowerCase();
        const groupId = this.groupIdInput.value.trim();
        // 检查是否有搜索内容
        if (!courseNumber && !courseName && !groupId) {
            alert('请输入搜索内容后再点击搜索！');
            return;
        }
        // 执行搜索
        const results = this.searchGroups(courseNumber, courseName, groupId);
        // 更新搜索结果
        this.searchResults = results;
        // 显示搜索结果
        this.renderGroups(results, this.searchResultsContainer);
    }
    // 搜索课程组
    searchGroups(courseNumber, courseName, groupId) {
        return groupInfo.filter(group => {
            // 课程编号匹配
            const matchesCourseNumber = courseNumber ? group.course_number === courseNumber : true;
            // 课程名称匹配（不区分大小写）
            const matchesCourseName = courseName ? group.course_name.toLowerCase().includes(courseName) : true;
            // 课程组ID匹配
            const matchesGroupId = groupId ? group.class_number_group_id === parseInt(groupId) : true;
            // 返回同时匹配所有条件的结果
            return matchesCourseNumber && matchesCourseName && matchesGroupId;
        });
    }
    // 处理清除
    handleClear() {
        // 清空输入框
        this.courseNumberInput.value = '';
        this.courseNameInput.value = '';
        this.groupIdInput.value = '';
        // 清空搜索结果
        this.searchResultsContainer.innerHTML = '';
    }
    // 渲染课程组列表
    renderGroups(groups, container) {
        if (groups.length === 0) {
            container.innerHTML = '<p class="no-results">没有找到匹配的课程组信息</p>';
            return;
        }
        container.innerHTML = groups.map(group => this.renderGroupCard(group)).join('');
        // 如果是搜索结果容器，绑定复选框事件并渲染迷你课表
        if (container === this.searchResultsContainer) {
            this.bindCheckboxEvents();
            this.renderMiniSchedules();
        }
    }
    // 渲染所有迷你课表
    renderMiniSchedules() {
        this.searchResults.forEach(group => {
            const tableElement = document.querySelector(`.mini-course-table[data-group-id="${group.class_number_group_id}"]`);
            if (tableElement) {
                tableElement.innerHTML = this.generateMiniScheduleHTML(group);
            }
        });
    }
    // 生成迷你课表的HTML
    generateMiniScheduleHTML(group) {
        // 创建7天×13节的表格，使用二维数组表示
        const schedule = Array(13).fill(null).map(() => Array(7).fill(false));
        // 填充课程时间
        group.parsed_time_location.forEach(timeLoc => {
            timeLoc.time_slots.forEach((timeSlot) => {
                const dayOfWeek = timeSlot.day_of_week; // 0=周日, 1=周一, ..., 6=周六
                timeSlot.periods.forEach((period) => {
                    if (period >= 1 && period <= 13) {
                        schedule[period - 1][dayOfWeek] = true;
                    }
                });
            });
        });
        // 生成HTML
        let html = '<tbody>';
        for (let period = 0; period < 13; period++) {
            html += '<tr>';
            for (let day = 0; day < 7; day++) {
                if (schedule[period][day]) {
                    html += '<td class="mini-class-period"></td>';
                }
                else {
                    html += '<td class="mini-empty-period"></td>';
                }
            }
            html += '</tr>';
        }
        html += '</tbody>';
        return html;
    }
    // 格式化周次信息
    formatWeekInfo(weekInfo) {
        const weekType = weekInfo.week_type ? `(${weekInfo.week_type})` : '';
        return `${weekInfo.start_week}~${weekInfo.end_week}周${weekType}`;
    }
    // 格式化星期几
    formatDayOfWeek(day) {
        const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return days[day] || `星期${day}`;
    }
    // 格式化时间段
    formatTimeSlots(timeSlots) {
        return timeSlots.map(slot => `${this.formatDayOfWeek(slot.day_of_week)}(${slot.periods.join(',')}节)`).join(' ');
    }
    // 格式化校区
    formatCampus(campus) {
        const campusNames = ['', '1号校区', '2号校区', '3号校区'];
        return campusNames[campus] || `校区${campus}`;
    }
    // 格式化课堂编号
    formatClassNumbers(classNumbers) {
        if (classNumbers.length > 10) {
            return '很多';
        }
        return classNumbers.join(',');
    }
    // 渲染课程组卡片
    renderGroupCard(group) {
        // 渲染解析后的时间地点信息
        const renderParsedTimeLocation = (parsedTimeLocation) => {
            return parsedTimeLocation.map(item => {
                return `
                    <div class="time-location-item">
                        <p><strong>周次:</strong> ${this.formatWeekInfo(item.week_info)}</p>
                        <p><strong>校区:</strong> ${this.formatCampus(item.campus)}</p>
                        <p><strong>时间:</strong> ${this.formatTimeSlots(item.time_slots)}</p>
                    </div>
                `;
            }).join('');
        };
        // 检查当前课程组是否已选中
        const isChecked = this.selectedGroupIds.has(group.class_number_group_id);
        return `
            <div class="group-card">
                <div class="card-header">
                    <input type="checkbox" class="group-checkbox" 
                           data-group-id="${group.class_number_group_id}" 
                           ${isChecked ? 'checked' : ''}>
                    <h3>${group.course_name}</h3>
                </div>
                <p><strong>课程组ID:</strong> ${group.class_number_group_id}</p>
                <p><strong>课程编号:</strong> ${group.course_number}</p>
                <p><strong>课堂编号:</strong> ${this.formatClassNumbers(group.class_numbers)}</p>
                <p><strong>学分:</strong> ${group.credit}</p>
                <p><strong>考核方式:</strong> ${group.assessment_method}</p>
                <div class="mini-schedule">
                    <strong>迷你课表:</strong>
                    <table class="mini-course-table" data-group-id="${group.class_number_group_id}">
                        <!-- 迷你课表将通过JavaScript生成 -->
                    </table>
                </div>
                <div class="time-location">
                    <strong>时间地点:</strong>
                    ${renderParsedTimeLocation(group.parsed_time_location)}
                </div>
            </div>
        `;
    }
    // 绑定搜索结果中的复选框事件
    bindCheckboxEvents() {
        this.searchResultsContainer.querySelectorAll('.group-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target;
                const groupId = parseInt(target.dataset.groupId);
                this.handleCheckboxChange(groupId, target.checked);
            });
        });
        
        // 为课程卡片添加点击事件
        this.searchResultsContainer.querySelectorAll('.group-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 如果点击的是复选框本身，不处理（让复选框自己的事件处理）
                if (e.target.classList.contains('group-checkbox')) {
                    return;
                }
                
                // 获取对应的复选框
                const checkbox = card.querySelector('.group-checkbox');
                if (checkbox) {
                    // 切换复选框状态
                    checkbox.checked = !checkbox.checked;
                    // 触发change事件
                    const groupId = parseInt(checkbox.dataset.groupId);
                    this.handleCheckboxChange(groupId, checkbox.checked);
                }
            });
            
            // 为卡片添加鼠标悬停样式提示
            card.style.cursor = 'pointer';
        });
    }
}
// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CourseGroupApp();
});
