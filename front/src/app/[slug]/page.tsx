import PublicViewPage from '../public-view/[slug]/page'

interface Props { params: Promise<{ slug: string }> }

export default async function Page({ params }: Props) {
  const resolvedParams = await params
  return <PublicViewPage params={resolvedParams} />
}
