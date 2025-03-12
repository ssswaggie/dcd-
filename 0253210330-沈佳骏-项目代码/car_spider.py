import pandas as pd
import json
import os

# 计算能源类型分布
def calculate_energy_distribution(df):
    # 统计各能源类型的销量
    energy_stats = df.groupby('etype')['counts'].sum()
    total_sales = energy_stats.sum()
    
    # 分类统计
    oil_sales = 0
    electric_sales = 0
    hybrid_sales = 0
    
    for etype, sales in energy_stats.items():
        if '汽油' in etype:
            oil_sales += sales
        elif '纯电动' in etype or '电动' in etype:
            electric_sales += sales
        elif '混' in etype:  # 包括混合动力、插电式混合动力等
            hybrid_sales += sales
    
    # 计算百分比
    return {
        'oil_percent': round(oil_sales / total_sales * 100, 2),
        'electric_percent': round(electric_sales / total_sales * 100, 2),
        'hybrid_percent': round(hybrid_sales / total_sales * 100, 2)
    }

def process_car_data():
    try:
        # 打印当前工作目录
        print(f"当前工作目录: {os.getcwd()}")
        
        # 检查CSV文件是否存在
        if not os.path.exists('car_sales.csv'):
            print("错误���不到 car_sales.csv 文件")
            return
        else:
            print("找到 car_sales.csv 文件")

        # 直接使用gb2312编码读取文件
        try:
            df = pd.read_csv('car_sales.csv', encoding='gb2312')
            print(f"成功读取CSV文件，共 {len(df)} 行数据")
        except Exception as e:
            print(f"读取文件失败: {e}")
            return
        
        # 处理列名
        df.columns = ['ranks', 'brandnames', 'names', 'counts', 'min_prices', 'max_prices', 'carModel', 'etype', 'marktime', 'insure']
        print("列名处理完成")
        
        # 清理数据中的空格和特殊字符
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].str.strip()
        print("数据清理完成")
        
        # 确保数值列为数值型
        df['counts'] = pd.to_numeric(df['counts'], errors='coerce')
        df['min_prices'] = pd.to_numeric(df['min_prices'], errors='coerce')
        df['max_prices'] = pd.to_numeric(df['max_prices'], errors='coerce')
        print("数值转换完成")
        
        # 创建数据目录
        try:
            os.makedirs('static', exist_ok=True)
            print("static目录创建/确认完成")
        except Exception as e:
            print(f"创建static目录时出错: {e}")
            return
        
        # 计算能源类型分布
        energy_distribution = calculate_energy_distribution(df)
        
        # 打印能源分布数据进行验证
        print("\n能源类型分布:")
        print(f"汽油车占比: {energy_distribution['oil_percent']}%")
        print(f"电动车占比: {energy_distribution['electric_percent']}%")
        print(f"混动车占比: {energy_distribution['hybrid_percent']}%")
        
        # 计算价格区间分布（考虑销量）
        price_ranges = [
            {'range': '0-10万', 'min': 0, 'max': 10},
            {'range': '10-20万', 'min': 10, 'max': 20},
            {'range': '20-30万', 'min': 20, 'max': 30},
            {'range': '30-50万', 'min': 30, 'max': 50},
            {'range': '50万以上', 'min': 50, 'max': float('inf')}
        ]

        price_distribution = []
        total_sales = df['counts'].sum()

        for price_range in price_ranges:
            if price_range['max'] == float('inf'):
                sales = df[df['min_prices'] >= price_range['min']]['counts'].sum()
            else:
                sales = df[(df['min_prices'] >= price_range['min']) & 
                          (df['min_prices'] < price_range['max'])]['counts'].sum()
            
            percentage = (sales / total_sales) * 100
            price_distribution.append({
                'range': price_range['range'],
                'value': int(sales),
                'percentage': round(percentage, 2)
            })
        
        # 在生成price_distribution后添加验证输出
        print("\n价格区间分布:")
        for item in price_distribution:
            print(f"{item['range']}: {item['value']} 辆 ({item['percentage']}%)")
        
        # 处理数据并转换为所需格式
        print("开始处理数据格式...")
        sales_data = {
            # 词云图数据
            'wordcloud': df.groupby('brandnames')['counts'].sum().reset_index().apply(
                lambda x: {'name': x['brandnames'], 'value': int(x['counts'])}, axis=1).tolist(),
            
            # 品牌销售占比数据（取前10名）
            'brand_pie': df.groupby('brandnames')['counts'].sum().nlargest(10).reset_index().apply(
                lambda x: {'name': x['brandnames'], 'value': int(x['counts'])}, axis=1).tolist(),
            
            # 价格区间分布
            'price_range': price_distribution,
            
            # 销售排行榜数据（取前10名）
            'sales_ranking': df.nlargest(10, 'counts').apply(
                lambda row: {
                    'rank': int(row['ranks']),
                    'brand': str(row['brandnames']),
                    'name': str(row['names']),
                    'sales': int(row['counts']),
                    'min_price': float(row['min_prices']),
                    'max_price': float(row['max_prices']),
                    'car_type': str(row['carModel']),
                    'energy_type': str(row['etype']),
                    'insurance': str(row['insure'])
                }, axis=1
            ).tolist(),
            
            # 能源类型分布
            'energy_type': df.groupby('etype')['counts'].sum().reset_index().apply(
                lambda x: {'name': x['etype'], 'value': int(x['counts'])}, axis=1).tolist(),
            
            # 添加能源类型分布数据
            'energy_distribution': {
                'title': '能源类型分布',
                'data': [
                    {'name': '汽油车', 'value': energy_distribution['oil_percent']},
                    {'name': '电动车', 'value': energy_distribution['electric_percent']},
                    {'name': '混动车', 'value': energy_distribution['hybrid_percent']}
                ]
            }
        }
        print("数据格式处理完成")
        
        # 保存JSON文件
        json_path = os.path.join('static', 'data.json')
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(sales_data, f, ensure_ascii=False, indent=2)
            print(f"数据成功保存到: {os.path.abspath(json_path)}")
            
            # 打印部分数据用于验证
            print("\n数据验证:")
            print("词云图数据示例:", sales_data['wordcloud'][:2])
            print("销售排行榜示例:", sales_data['sales_ranking'][:2])
            
        except Exception as e:
            print(f"保存JSON文件时出错: {e}")
            
    except Exception as e:
        print(f"处理过程中出现错误: {str(e)}")
        import traceback
        print("详细错误信息:")
        print(traceback.format_exc())

if __name__ == '__main__':
    process_car_data()