import json
from parse_time_location import parse_time_location

# 字段名映射表：中文 -> 英文
FIELD_MAPPING = {
    "课堂号": "class_id",
    "课程名": "course_name",
    "开课单位": "department",
    "授课教师": "teachers",
    "时间地点": "time_location",
    "学分": "credit",
    "学时": "hours",
    "学历层次": "education_level",
    "课堂类型": "class_type",
    "课程范畴分类": "course_category",
    "课程类型": "course_type",
    "授课语言": "teaching_language",
    "考核方式": "assessment_method",
    "本研同堂": "undergraduate_graduate_together",
    "选课人数": "enrolled_students",
    "限选人数": "maximum_students",
    "上课班级": "target_classes"
}

# 主程序
def main():
    # 读取原始JSON文件
    with open('classInfo.json', 'r', encoding='utf-8') as f:
        class_data = json.load(f)
    
    # 处理每个课程的时间地点信息
    processed_data = []
    error_count = 0
    
    for i, course in enumerate(class_data):
        try:
            # 获取原始时间地点信息
            original_time_location = course.get('时间地点', '')
            
            # 解析时间地点信息
            parsed_time_location = parse_time_location(original_time_location)
            
            # 创建新的课程条目，将中文字段名转换为英文
            processed_course = {}
            for chinese_field, english_field in FIELD_MAPPING.items():
                value = course.get(chinese_field)
                # 删除time_location字段中的_x000d_字符串
                if chinese_field == "时间地点" and value:
                    value = value.replace('_x000d_', '')
                processed_course[english_field] = value
            
            # 拆分class_id为课程编号和课堂编号
            class_id = processed_course.get('class_id', '')
            if '.' in class_id:
                course_number, class_number = class_id.split('.', 1)
                processed_course['course_number'] = course_number
                processed_course['class_number'] = class_number
            else:
                processed_course['course_number'] = class_id
                processed_course['class_number'] = None
            
            # 添加解析后的时间地点字段
            processed_course['parsed_time_location'] = parsed_time_location
            
            processed_data.append(processed_course)
            
            # 打印进度信息
            if (i + 1) % 100 == 0:
                print(f"已处理 {i + 1}/{len(class_data)} 条记录")
                
        except Exception as e:
            # 记录错误并继续处理其他记录
            print(f"处理第 {i + 1} 条记录时出错: {e}")
            print(f"原始时间地点信息: {original_time_location}")
            error_count += 1
            # 即使出错也要保留原始数据
            processed_course = course.copy()
            processed_course['parsed_time_location'] = []
            processed_data.append(processed_course)
    
    # 将处理后的数据保存为新的JSON文件
    with open('classInfo_processed.json', 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n处理完成！")
    print(f"共处理 {len(class_data)} 条记录")
    print(f"其中 {error_count} 条记录处理时出现错误")
    print(f"处理后的数据已保存到 classInfo_processed.json")

# 运行主程序
if __name__ == "__main__":
    main()
