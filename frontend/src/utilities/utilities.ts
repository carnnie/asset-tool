import axios from 'axios';
import { anyInsightObj, anyOptionsState, marsParams } from './interfaces';

const defaultMapFunc = (item: anyInsightObj, index: number, _itemType: string) => ({
  id: index,
  label: item.Name,
  key: item.Key,
});

export async function configureOptions(
  inputData: marsParams,
  setFieldState: React.Dispatch<React.SetStateAction<anyOptionsState>>,
  mapFunc = defaultMapFunc
) {
  const response = await axios.post('http://127.0.0.1:8000/iql/', {
    itemType: inputData.itemType,
    iql: inputData.iql,
  });
  const options = response.data.result.map((item: anyInsightObj, index: number) =>
    mapFunc(item, index, inputData.itemType)
  );
  setFieldState((lastState) => ({ ...lastState, [inputData.itemType]: options }));
}
