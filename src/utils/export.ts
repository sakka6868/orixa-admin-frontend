import axios from 'axios';

const requesterInstance = axios.create({
    baseURL: import.meta.env.VITE_GATEWAY_URL || '',
    timeout: 30000,
});

export const exportToCsv = async (
    endpoint: string,
    filename: string,
    params?: Record<string, string>
) => {
    try {
        const response = await requesterInstance.get(endpoint, {
            params,
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${window.sessionStorage.getItem("USER_TOKEN")}`
            }
        });

        const blob = new Blob([response.data], {type: 'text/csv;charset=utf-8'});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};

export const exportToExcel = async (
    endpoint: string,
    filename: string,
    params?: Record<string, string>
) => {
    // For now, export as CSV (Excel can open CSV files)
    // In future, can be extended to use xlsx library for true Excel format
    return exportToCsv(endpoint, filename, params);
};
