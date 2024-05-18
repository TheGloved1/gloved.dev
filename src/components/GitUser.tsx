"use client"
import React, { useEffect, useState } from 'react';

interface UserData {
  html_url: string;
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
}

type GitUserProps = {
  name: string
}

export default function GitUser({ name }: GitUserProps) {
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${name}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: UserData = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    void fetchData();
  }, [name]);

  return (
    <div className="container ring ring-white gap-4">
      {data && (
        <>
          <div className="image-container git-image-container">
            <a href={data.html_url} target="_blank" rel="noopener">
              <img src={data.avatar_url} alt="User image" />
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
