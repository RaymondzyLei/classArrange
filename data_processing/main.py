import os
import subprocess
import sys

def run_script(script_name, description):
    """运行指定的Python脚本并显示进度"""
    print(f"\n{'='*50}")
    print(f"正在{description}...")
    print(f"{'='*50}")
    
    # 在Windows环境下使用系统默认编码
    result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    
    # 打印输出
    if result.stdout:
        print("输出:")
        print(result.stdout)
    
    # 打印错误
    if result.stderr:
        print("错误:")
        print(result.stderr)
    
    # 检查返回码
    if result.returncode != 0:
        print(f"\n❌ {script_name} 执行失败")
        print(f"返回码: {result.returncode}")
        return False
    else:
        print(f"\n✅ {script_name} 执行成功")
        return True


def main():
    print("="*50)
    print("开始从Excel到最终数据的完整处理流程")
    print("="*50)
    
    # 检查是否存在classInfo.xlsx文件
    if not os.path.exists('classInfo.xlsx'):
        print("❌ 错误: 未找到classInfo.xlsx文件")
        print("请确保classInfo.xlsx文件在当前目录下")
        return False
    
    # 步骤1: Excel转JSON
    if not run_script('excel_to_json.py', '将Excel文件转换为JSON格式'):
        return False
    
    # 检查是否生成了classInfo.json文件
    if not os.path.exists('classInfo.json'):
        print("❌ 错误: 未生成classInfo.json文件")
        return False
    
    # 步骤2: 处理课程信息（包括时间地点解析、字段名转换等）
    if not run_script('process_class_info.py', '处理课程信息（时间地点解析、字段名转换等）'):
        return False
    
    # 检查是否生成了classInfo_processed.json文件
    if not os.path.exists('classInfo_processed.json'):
        print("❌ 错误: 未生成classInfo_processed.json文件")
        return False
    
    # 步骤3: 生成class_number_group数据
    if not run_script('process_class_number_group.py', '生成class_number_group数据'):
        return False
    
    # 检查是否生成了最终文件
    if not os.path.exists('classNumberGroup.json') or not os.path.exists('classInfo_processed_with_group_id.json'):
        print("❌ 错误: 未生成最终的classNumberGroup.json或classInfo_processed_with_group_id.json文件")
        return False
    
    # 步骤4: 生成JavaScript数据文件
    if not run_script('json_to_js.py', '将JSON数据转换为JavaScript代码'):
        return False
    
    # 检查是否生成了JavaScript文件
    if not os.path.exists('class_info_data.js'):
        print("❌ 错误: 未生成class_info_data.js文件")
        return False
    
    print("\n" + "="*50)
    print("🎉 所有数据处理流程已成功完成！")
    print("="*50)
    print("生成的文件:")
    print("- classInfo.json: 原始Excel数据的JSON格式")
    print("- classInfo_processed.json: 处理后的课程信息")
    print("- classNumberGroup.json: 按时间和校区分组的课程数据")
    print("- classInfo_processed_with_group_id.json: 包含group_id的课程信息")
    print("- class_info_data.js: JavaScript格式的数据文件，包含classInfo和groupInfo")
    print("="*50)
    
    return True


if __name__ == "__main__":
    main()
