import pandas
import csv

filepath = (
    "C:/Users/ilya.pashutin/Desktop/ASSETS_IT_NEW_list_equipment_20240708_050010.csv"
)    

with open(filepath, 'r', encoding = 'utf-8') as csvfile:
    datareader = csv.reader(csvfile, delimiter=";")
    line_count = 0
    columns = []
    for row in datareader:
        # Инвентарные номера находятся находятся в 4 и 5 колонках
        if line_count == 0:
            columns = row
        if line_count == 300:
            break
        print(row)
        line_count += 1

# report = pandas.read_csv(filepath, header=None, delimiter=";", names=range(16))

# for row in report.itertuples():
#     print(row)
 