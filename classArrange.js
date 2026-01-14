// 应用类
class CourseGroupApp {
    constructor() {
        // 初始化DOM元素
        this.selectedGroupsContainer = document.getElementById('selected-groups-container');
        this.arrangeCoursesBtn = document.getElementById('arrange-courses-btn');
        this.preferencesModal = document.getElementById('preferences-modal');
        this.resultsModal = document.getElementById('results-modal');
        this.confirmBtn = document.getElementById('confirm-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.closeResultsBtn = document.getElementById('close-results-btn');
        this.resultsContainer = document.getElementById('results-container');
        // 初始化完整课表DOM元素
        this.fullScheduleModal = document.getElementById('full-schedule-modal');
        this.closeScheduleBtn = document.getElementById('close-schedule-btn');
        this.currentWeekNumber = document.getElementById('current-week-number');
        this.customWeekInput = document.getElementById('custom-week-input');
        this.prevWeekBtn = document.getElementById('prev-week-btn');
        this.nextWeekBtn = document.getElementById('next-week-btn');
        this.goWeekBtn = document.getElementById('go-week-btn');
        this.fullScheduleContent = document.getElementById('full-schedule-content');
        // 初始化已选课程组ID集合
        this.selectedGroupIds = this.loadSelectedGroupsFromStorage();
        // 初始化课表状态
        this.currentWeek = 1;
        this.currentPlan = null;
        // 初始化应用
        this.init();
    }
    init() {
        // 初始化应用
        this.updateSelectedGroupsDisplay();
        this.bindEvents();
    }
    // 绑定事件
    bindEvents() {
        // 排课按钮点击事件
        this.arrangeCoursesBtn.addEventListener('click', () => this.showPreferencesModal());
        // 弹窗按钮事件
        this.confirmBtn.addEventListener('click', () => this.handlePreferencesConfirm());
        this.cancelBtn.addEventListener('click', () => this.hidePreferencesModal());
        this.closeResultsBtn.addEventListener('click', () => this.hideResultsModal());
        // 完整课表按钮事件
        this.closeScheduleBtn.addEventListener('click', () => this.hideFullScheduleModal());
        this.prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
        this.nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
        this.goWeekBtn.addEventListener('click', () => this.goToCustomWeek());
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.preferencesModal) {
                this.hidePreferencesModal();
            }
            else if (e.target === this.resultsModal) {
                this.hideResultsModal();
            }
            else if (e.target === this.fullScheduleModal) {
                this.hideFullScheduleModal();
            }
        });
    }
    // 显示介意值输入弹窗
    showPreferencesModal() {
        if (this.selectedGroupIds.size === 0) {
            alert('请先选择课程组');
            return;
        }
        this.preferencesModal.style.display = 'block';
    }
    // 隐藏介意值输入弹窗
    hidePreferencesModal() {
        this.preferencesModal.style.display = 'none';
    }
    // 显示排课结果弹窗
    showResultsModal() {
        this.resultsModal.style.display = 'block';
    }
    // 隐藏排课结果弹窗
    hideResultsModal() {
        this.resultsModal.style.display = 'none';
    }
    // 显示完整课表弹窗
    showFullScheduleModal(plan) {
        this.currentPlan = plan;
        this.currentWeek = 1;
        this.updateWeekDisplay();
        this.generateFullSchedule();
        this.fullScheduleModal.style.display = 'block';
    }
    // 隐藏完整课表弹窗
    hideFullScheduleModal() {
        this.fullScheduleModal.style.display = 'none';
    }
    // 更新周数显示
    updateWeekDisplay() {
        this.currentWeekNumber.textContent = this.currentWeek.toString();
        this.customWeekInput.value = this.currentWeek.toString();
    }
    // 切换周数
    changeWeek(delta) {
        const newWeek = this.currentWeek + delta;
        if (newWeek >= 1 && newWeek <= 18) {
            this.currentWeek = newWeek;
            this.updateWeekDisplay();
            this.generateFullSchedule();
        }
    }
    // 跳转到自定义周数
    goToCustomWeek() {
        const customWeek = parseInt(this.customWeekInput.value);
        if (customWeek >= 1 && customWeek <= 18) {
            this.currentWeek = customWeek;
            this.updateWeekDisplay();
            this.generateFullSchedule();
        }
        else {
            alert('周数必须在1-18之间');
            this.customWeekInput.value = this.currentWeek.toString();
        }
    }
    // 生成完整课表
    generateFullSchedule() {
        if (!this.currentPlan)
            return;
        // 创建13节×7天的表格，使用二维数组表示
        const schedule = Array(13).fill(null).map(() => Array(7).fill(null).map(() => []));
        // 填充课程时间
        this.currentPlan.forEach(group => {
            group.parsed_time_location.forEach(timeLoc => {
                // 检查当前周是否在课程周次范围内
                if (!this.isWeekInRange(this.currentWeek, timeLoc.week_info)) {
                    return;
                }
                timeLoc.time_slots.forEach((timeSlot) => {
                    const dayOfWeek = timeSlot.day_of_week; // 0=周日, 1=周一, ..., 6=周六
                    timeSlot.periods.forEach((period) => {
                        if (period >= 1 && period <= 13) {
                            schedule[period - 1][dayOfWeek].push(group);
                        }
                    });
                });
            });
        });
        // 生成HTML
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        let html = `
            <table class="full-course-table">
                <thead>
                    <tr>
                        <th class="period-header"></th>
        `;
        // 添加表头（星期几）
        dayNames.forEach(dayName => {
            html += `<th>${dayName}</th>`;
        });
        html += `
                    </tr>
                </thead>
                <tbody>
        `;
        // 添加表格内容
        for (let period = 0; period < 13; period++) {
            html += `<tr>
                <th class="period-header">${period + 1}</th>`;
            for (let day = 0; day < 7; day++) {
                const courses = schedule[period][day];
                if (courses.length > 0) {
                    html += `<td class="course-cell">
                        ${courses.map(course => `
                            <div class="course-name">${course.course_name}</div>
                            <div class="course-info">校区: ${this.formatCampus(course.parsed_time_location[0].campus)}</div>
                        `).join('')}
                    </td>`;
                }
                else {
                    html += '<td></td>';
                }
            }
            html += '</tr>';
        }
        html += `
                </tbody>
            </table>
        `;
        this.fullScheduleContent.innerHTML = html;
    }
    // 格式化校区
    formatCampus(campus) {
        const campusNames = ['', '1号校区', '2号校区', '3号校区'];
        return campusNames[campus] || `校区${campus}`;
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
    // 处理删除课程组
    handleRemoveGroup(groupId) {
        this.selectedGroupIds.delete(groupId);
        // 保存到localStorage
        this.saveSelectedGroupsToStorage();
        // 更新已选课程组显示
        this.updateSelectedGroupsDisplay();
    }
    // 更新已选课程组显示
    updateSelectedGroupsDisplay() {
        if (this.selectedGroupIds.size === 0) {
            this.selectedGroupsContainer.innerHTML = '<p class="no-selections">暂无选择的课程组</p>';
            this.arrangeCoursesBtn.setAttribute('disabled', 'true');
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
        // 绑定删除按钮事件
        this.selectedGroupsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = parseInt(e.target.dataset.groupId);
                this.handleRemoveGroup(groupId);
            });
        });
        // 启用排课按钮
        this.arrangeCoursesBtn.removeAttribute('disabled');
    }
    // 格式化课堂编号
    formatClassNumbers(classNumbers) {
        if (classNumbers.length > 10) {
            return '很多';
        }
        return classNumbers.join(',');
    }
    // 处理介意值确认
    handlePreferencesConfirm() {
        // 获取用户输入的介意值
        const timeConflictValue = parseInt(document.getElementById('time-conflict').value) || 0;
        const campusConflictValue = parseInt(document.getElementById('campus-conflict').value) || 0;
        const morningConflictValue = parseInt(document.getElementById('morning-conflict').value) || 0;
        const eveningConflictValue = parseInt(document.getElementById('evening-conflict').value) || 0;
        const preferences = {
            time_conflict_value: timeConflictValue,
            campus_conflict_value: campusConflictValue,
            morning_conflict_value: morningConflictValue,
            evening_conflict_value: eveningConflictValue
        };
        // 隐藏弹窗
        this.hidePreferencesModal();
        // 开始排课
        this.arrangeCourses(preferences);
    }
    // 开始排课
    arrangeCourses(preferences) {
        // 获取已选课程组的详细信息
        const selectedGroups = Array.from(this.selectedGroupIds)
            .map(id => groupInfo.find(group => group.class_number_group_id === id))
            .filter((group) => group !== undefined);
        // 按course_number分组
        const groupsByCourseNumber = this.groupByCourseNumber(selectedGroups);
        // 生成所有可能的选课方案
        const allPlans = this.generateAllPlans(groupsByCourseNumber);
        // 计算每个方案的介意值
        const plansWithScores = allPlans.map(plan => this.calculatePreferenceScore(plan, preferences));
        // 按介意值排序，选择前5个
        const topPlans = plansWithScores
            .sort((a, b) => a.sum_value - b.sum_value)
            .slice(0, 5);
        // 显示结果
        this.displayResults(topPlans);
    }
    // 按course_number分组
    groupByCourseNumber(groups) {
        const result = new Map();
        for (const group of groups) {
            if (!result.has(group.course_number)) {
                result.set(group.course_number, []);
            }
            result.get(group.course_number).push(group);
        }
        return result;
    }
    // 生成所有可能的选课方案
    generateAllPlans(groupsByCourseNumber) {
        // 获取所有course_number的列表
        const courseNumbers = Array.from(groupsByCourseNumber.keys());
        // 递归生成所有组合
        const generateCombinations = (index) => {
            if (index === courseNumbers.length) {
                return [[]];
            }
            const currentCourseNumber = courseNumbers[index];
            const currentGroups = groupsByCourseNumber.get(currentCourseNumber);
            const restCombinations = generateCombinations(index + 1);
            const result = [];
            // 为当前课程的每个选项，与剩余课程的所有组合进行组合
            for (const group of currentGroups) {
                for (const rest of restCombinations) {
                    result.push([group, ...rest]);
                }
            }
            return result;
        };
        return generateCombinations(0);
    }
    // 计算方案的介意值
    calculatePreferenceScore(plan, preferences) {
        const conflicts = {
            time_conflicts: 0,
            campus_conflicts: 0,
            morning_conflicts: 0,
            evening_conflicts: 0
        };
        // 遍历1-18周
        for (let week = 1; week <= 18; week++) {
            // 时间槽映射：存储每天每节课的课程信息
            const timeSlots = new Map();
            // 校区映射：存储每天上午和下午的校区信息
            const campusMap = new Map();
            // 遍历方案中的每个课程组
            for (const group of plan) {
                // 遍历课程组的时间地点信息
                for (const timeLocation of group.parsed_time_location) {
                    // 检查当前周是否在课程周次范围内
                    if (!this.isWeekInRange(week, timeLocation.week_info)) {
                        continue;
                    }
                    // 遍历时间段
                    for (const timeSlot of timeLocation.time_slots) {
                        const day = timeSlot.day_of_week;
                        const campus = timeLocation.campus;
                        // 检查早上第1节有课的情况
                        if (timeSlot.periods.includes(1)) {
                            conflicts.morning_conflicts++;
                        }
                        // 检查晚上第11节有课的情况
                        if (timeSlot.periods.includes(11)) {
                            conflicts.evening_conflicts++;
                        }
                        // 检查时间冲突
                        for (const period of timeSlot.periods) {
                            const key = `${day}-${period}`;
                            if (!timeSlots.has(key)) {
                                timeSlots.set(key, []);
                            }
                            timeSlots.get(key).push({ week, day, period, campus });
                        }
                        // 记录校区信息
                        for (const period of timeSlot.periods) {
                            const session = this.getSession(period);
                            const key = `${day}-${session}`;
                            if (!campusMap.has(key)) {
                                campusMap.set(key, new Set());
                            }
                            if (campus !== null) {
                                campusMap.get(key).add(campus);
                            }
                        }
                    }
                }
            }
            // 计算时间冲突
            for (const slots of timeSlots.values()) {
                if (slots.length > 1) {
                    conflicts.time_conflicts += (slots.length - 1);
                }
            }
            // 计算校区冲突
            for (const campuses of campusMap.values()) {
                if (campuses.size > 1) {
                    conflicts.campus_conflicts++;
                }
            }
        }
        // 计算总介意值
        const sum_value = conflicts.time_conflicts * preferences.time_conflict_value +
            conflicts.campus_conflicts * preferences.campus_conflict_value +
            conflicts.morning_conflicts * preferences.morning_conflict_value +
            conflicts.evening_conflicts * preferences.evening_conflict_value;
        return {
            groups: plan,
            sum_value,
            conflicts
        };
    }
    // 检查当前周是否在课程周次范围内
    isWeekInRange(week, weekInfo) {
        // 检查周次是否在范围内
        if (week < weekInfo.start_week || week > weekInfo.end_week) {
            return false;
        }
        // 检查周次类型
        if (!weekInfo.week_type) {
            return true; // 普通周
        }
        // 单周或双周
        if (weekInfo.week_type === '单' && week % 2 !== 1) {
            return false;
        }
        if (weekInfo.week_type === '双' && week % 2 !== 0) {
            return false;
        }
        return true;
    }
    // 获取时间段（上午/下午）
    getSession(period) {
        if (period >= 1 && period <= 5) {
            return 'morning';
        }
        else if (period >= 6 && period <= 10) {
            return 'afternoon';
        }
        return 'evening'; // 晚上单独处理，不考虑校区冲突
    }
    // 显示排课结果
    displayResults(plans) {
        if (plans.length === 0) {
            this.resultsContainer.innerHTML = '<p>没有找到合适的排课方案</p>';
            this.showResultsModal();
            return;
        }
        this.resultsContainer.innerHTML = plans.map((plan, index) => {
            const { conflicts, sum_value } = plan;
            return `
                <div class="result-item" data-plan-index="${index}">
                    <h4>方案 ${index + 1} (总介意值: ${sum_value})</h4>
                    <p><strong>冲突情况:</strong></p>
                    <p>时间冲突: ${conflicts.time_conflicts}次</p>
                    <p>校区冲突: ${conflicts.campus_conflicts}次</p>
                    <p>早上第1节有课: ${conflicts.morning_conflicts}次</p>
                    <p>晚上第11节有课: ${conflicts.evening_conflicts}次</p>
                    <p><strong>课程安排:</strong></p>
                    <ul>
                        ${plan.groups.map(group => `
                            <li>
                                ${group.course_name} (ID: ${group.class_number_group_id})
                                <br><small>课程编号: ${group.course_number} | 课堂编号: ${this.formatClassNumbers(group.class_numbers)}</small>
                            </li>
                        `).join('')}
                    </ul>
                    <div class="result-actions">
                        <button class="view-schedule-btn" data-plan-index="${index}">查看课表</button>
                    </div>
                </div>
            `;
        }).join('');
        // 绑定查看课表按钮事件
        this.resultsContainer.querySelectorAll('.view-schedule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planIndex = parseInt(e.target.dataset.planIndex);
                this.showFullScheduleModal(plans[planIndex].groups);
            });
        });
        this.showResultsModal();
    }
}
// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CourseGroupApp();
});
