"use client"
import React, { useEffect, useState } from 'react';

type GitUserProps = {
  name: string
}

export default function GitUser({ name }: GitUserProps) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`https://api.github.com/users/${name}`);
      const data = await response.json();
      setData(data);
    };

    fetchData();
  }, [name]);

  return (
    <div className="container ring ring-white gap-4">
      {data && (
        <>
          <div className="image-container git-image-container">
            <a href={data.html_url} target="_blank" rel="noopener">
              <img src={data.avatar_url} alt="User image"></img>
            </a>
          </div>
          <h2>{data.name}</h2>
          <span>{data.login}</span>
          <p>{data.bio}</p>
          <a className="fancy-link" href={data.html_url} target="_blank" rel="noopener">
            {data.html_url}
          </a>
        </>
      )}
    </div>
  );
}
