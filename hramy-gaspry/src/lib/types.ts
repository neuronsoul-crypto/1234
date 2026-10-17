export type ServiceItem = {
  id: number
  date: string
  time: string
  title: string
  type: string
  status: string
  feast: string
  feastRank: string
  note: string
  celebrant: string
  church: { id: number; slug: string; shortName: string; name: string; color: string; address: string }
}
