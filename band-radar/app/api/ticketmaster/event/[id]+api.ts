export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = new URL(request.url).searchParams.get('id');
  console.log(id);

  return Response.json({ id });
}
