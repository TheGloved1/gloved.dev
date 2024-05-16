type GitUserProps = {
  name: string
}

async function fetchGitUser(name: string) {
  let gitUserResponse = null;

  try {
    const response = await fetch(`https://api.github.com/users/${name}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    gitUserResponse = await response.json();
  } catch (error) {
    console.error('There was a problem with the fetch operation: ', error);
    gitUserResponse = null;
  }
  return gitUserResponse;
}

export default async function GitUser(name: GitUserProps) {
  const gitUser = await fetchGitUser(name.name)

  return (
    <div className="container ring ring-white">
      <div className="image-container git-image-container">
        <a href={gitUser.html_url} target="_blank" rel="noopener">
          <img src={gitUser.avatar_url} alt="User image" />
        </a>
      </div>
      <h2>{gitUser.name}</h2>
      <span>{gitUser.login}</span>
      <p>{gitUser.bio}</p>
      <a className="fancy-link" href={gitUser.html_url} target="_blank" rel="noopener">
        {gitUser.html_url}
      </a>
    </div>
  )
}
