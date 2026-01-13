import json
import hashlib

def process_class_number_group():
    # 读取处理后的JSON文件
    with open('classInfo_processed.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 用于存储class_number_group的字典
    class_number_groups = {}
    # 创建一个映射，用于快速查找每个(class_number, course_number)对应的group_id
    class_to_group_map = {}
    
    # 处理每个课程
    for course in data:
        course_number = course['course_number']
        class_number = course['class_number']
        parsed_time_location = course['parsed_time_location']
        campus = parsed_time_location[0]['campus'] if parsed_time_location else None
        
        # 创建一个用于标识时间和校区的键
        # 包括所有解析后的时间信息（除了location）和校区
        time_keys = []
        for time_slot in parsed_time_location:
            # 删除location字段
            time_slot_without_location = {k: v for k, v in time_slot.items() if k != 'location'}
            time_keys.append(time_slot_without_location)
        
        # 使用课程号、时间信息和校区创建唯一键，确保同一group只包含相同course_number的课程
        key_data = {"course_number": course_number, "campus": campus, "time_slots": time_keys}
        key = hashlib.md5(json.dumps(key_data, sort_keys=True).encode('utf-8')).hexdigest()
        
        # 如果键不存在，创建新的class_number_group
        if key not in class_number_groups:
            group_id = len(class_number_groups) + 1
            class_number_groups[key] = {
                "class_number_group_id": group_id,
                "course_number": course_number,
                "class_numbers": [class_number],
                "course_name": course['course_name'],
                "credit": course['credit'],
                "assessment_method": course['assessment_method'],
                "parsed_time_location": time_keys
            }
            # 立即更新映射
            class_to_group_map[(course_number, class_number)] = group_id
        else:
            # 如果键存在，获取group_id
            group_id = class_number_groups[key]['class_number_group_id']
            # 添加class_number到现有group（如果不存在）
            if class_number not in class_number_groups[key]['class_numbers']:
                class_number_groups[key]['class_numbers'].append(class_number)
            # 更新映射
            class_to_group_map[(course_number, class_number)] = group_id
    
    # 转换为列表格式
    class_number_group_list = list(class_number_groups.values())
    
    # 生成classNumberGroup.json
    with open('classNumberGroup.json', 'w', encoding='utf-8') as f:
        json.dump(class_number_group_list, f, ensure_ascii=False, indent=4)
    
    # 生成classInfo_processed_with_group_id.json
    data_with_group_id = []
    for course in data:
        course_copy = course.copy()
        key = (course['course_number'], course['class_number'])
        # 现在每个课程都应该有对应的group_id
        course_copy['class_number_group_id'] = class_to_group_map.get(key)
        data_with_group_id.append(course_copy)
    
    with open('classInfo_processed_with_group_id.json', 'w', encoding='utf-8') as f:
        json.dump(data_with_group_id, f, ensure_ascii=False, indent=4)
    
    print("处理完成！")
    print(f"生成了 {len(class_number_group_list)} 个class_number_group")
    print("文件已保存：classNumberGroup.json 和 classInfo_processed_with_group_id.json")

if __name__ == "__main__":
    process_class_number_group()