import { axiosInstance } from '@/lib/axios';
import { TSales, TSalesCategory, TSalesProduct } from '@/models/sales';

export async function fetchSales(
  setSales: (value: React.SetStateAction<TSales[]>) => void,
) {
  try {
    const axios = axiosInstance();
    const response = await axios.get('/reports/monthly-report');
    setSales(response.data.data);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchSalesByCategory(
  setSalesCategory: (value: React.SetStateAction<TSalesCategory[]>) => void,
) {
  try {
    const axios = axiosInstance();
    const response = await axios.get('/reports/monthly-category-report');
    setSalesCategory(response.data.data);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchSalesByProduct(
  setSalesProduct: (value: React.SetStateAction<TSalesProduct[]>) => void,
) {
  try {
    const axios = axiosInstance();
    const response = await axios.get('/reports/monthly-product-report');
    setSalesProduct(response.data.data);
  } catch (error) {
    console.log(error);
  }
}
