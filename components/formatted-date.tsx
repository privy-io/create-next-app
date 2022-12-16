type Props = {
  secsSinceEpoch: number;
};

export default function FormattedDate({secsSinceEpoch}: Props) {
  const formattedDate = new Date(secsSinceEpoch * 1000).toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return <p>{formattedDate}</p>;
}
