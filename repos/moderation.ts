export const fetchReportOptions = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SAFE_SKIES_API}/api/moderation/report-options`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch report options');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching report options:', error);
    throw error;
  }
};
