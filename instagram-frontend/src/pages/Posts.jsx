import { useEffect, useState } from "react";

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch posts");

        setPosts(data);
      } catch (error) {
        alert(error.message);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Posts</h2>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <h3>{post.username}</h3>
            <p>{post.caption}</p>
            {post.image && <img src={post.image} alt="Post" width="200" />}
          </div>
        ))
      )}
    </div>
  );
};

export default Posts;
