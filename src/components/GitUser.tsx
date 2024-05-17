/* eslint-disable @typescript-eslint/no-unsafe-assignment */

type GitUserProps = {
  name: string
}

export default async function GitUser({ name }: GitUserProps) {
  const response = await fetch(`https://api.github.com/users/${name}`)
  const data = await response.json()

  return (
    <div className="container ring ring-white gap-4">
      {data && (
        <div className="image-container git-image-container">
          <a href={data.html_url} target="_blank" rel="noopener">
            <img src={data.avatar_url} alt="User image" />
          </a>
        </div>
      )}
      {data && (
        <>
          <h2>{data.name}</h2>
          <span>{data.login}</span>
          <p>{data.bio}</p>
          <a className="fancy-link" href={data.html_url} target="_blank" rel="noopener">
            {data.html_url}
          </a>
        </>
      )}
    </div>
  )
}
