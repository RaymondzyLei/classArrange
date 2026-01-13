import json
import re

# 解析时间地点信息的函数
def parse_time_location(time_location_str):
    # 处理None或空字符串的情况
    if not time_location_str or time_location_str is None:
        return []
        
    # 确保是字符串类型
    time_location_str = str(time_location_str)
    
    # 处理可能的换行符和特殊字符
    # 先删除所有的_x000d_字符串，然后处理换行符
    time_location_str = time_location_str.replace('_x000d_', '').replace('\n', ';')
    
    # 分割多个时间段
    time_segments = [segment.strip() for segment in time_location_str.split(';') if segment.strip()]
    
    parsed_result = []
    
    for segment in time_segments:
        # 正则表达式匹配周次、地点、时间段
        pattern = r'^(.*?)周\s+(.*?):\s+(.*)$'
        match = re.match(pattern, segment)
        
        if not match:
            continue
            
        week_info = match.group(1).strip()
        location = match.group(2).strip()
        time_slots = match.group(3).strip()
        
        # 解析校区信息
        campus = None
        if location:
            if location.startswith(('1', '2', '5')):
                campus = 1
            elif location.startswith('3'):
                campus = 2
            elif location.startswith('GT'):
                campus = 3
        
        # 解析周次信息
        week_pattern = r'^(\d+)~(\d+)(?:\((单|双)\))?$'
        week_match = re.match(week_pattern, week_info)
        
        if not week_match:
            continue
            
        start_week = int(week_match.group(1))
        end_week = int(week_match.group(2))
        week_type = week_match.group(3)  # '单', '双', 或 None
        
        # 解析时间段信息
        # 匹配类似 "4(3,4) 5(1,2)" 的格式
        slot_pattern = r'(\d+)\(([\d,]+)\)'
        slots = re.findall(slot_pattern, time_slots)
        
        # 转换为结构化数据
        time_slots_list = []
        for day, periods in slots:
            day_of_week = int(day)  # 1-7表示周一到周日
            periods_list = [int(p) for p in periods.split(',')]
            time_slots_list.append({
                'day_of_week': day_of_week,
                'periods': periods_list
            })
        
        # 构建单个时间段的解析结果
        parsed_segment = {
            'week_info': {
                'start_week': start_week,
                'end_week': end_week,
                'week_type': week_type  # None表示全周，'单'表示单周，'双'表示双周
            },
            'location': location,
            'campus': campus,
            'time_slots': time_slots_list
        }
        
        parsed_result.append(parsed_segment)
    
    return parsed_result

# 测试函数
def test_parser():
    test_cases = [
        "1~16周 3C202: 4(3,4)",
        "2~16(双)周 3C202: 4(5)",
        "1~8周 1201: 2(8,9) 4(3,4,5)_x000d_\n9~12周 1201: 2(8,9) 4(3,4,5)",
        "3~15(单)周 5201: 3(6,7,8)"
    ]
    
    for i, test_case in enumerate(test_cases):
        print(f"测试用例 {i+1}: {test_case}")
        result = parse_time_location(test_case)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print()

# 如果直接运行此文件，执行测试
if __name__ == "__main__":
    test_parser()
