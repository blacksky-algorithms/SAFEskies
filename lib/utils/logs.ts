export const getDateTimeRange = (dateRange: {
  fromDate: string;
  toDate: string;
}) => {
  const fromDateTime = `${dateRange.fromDate}T00:00:00.000Z`;
  const toDateTime = `${dateRange.toDate}T23:59:59.999Z`;

  return { fromDateTime, toDateTime };
};
