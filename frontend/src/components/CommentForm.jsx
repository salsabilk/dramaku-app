import { StarRating } from "star-ratings-react";
import { useState } from "react";
 

function CommentForm({ user, drama}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const addComent = (event) => {
    event.preventDefault();
    const data = {
      rating,
      comment,
      user,
      drama,
    };
    fetch( process.env.REACT_APP_BASE_API_URL + "/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((rating, comment) => {
      setRating(0);
      setComment("");
    })
    .catch((error) => {
      console.error("Error adding comment:", error);
    });
  };
  return (
    <form action="" method="post" onSubmit={addComent}>
      <div className="px-4 py-3">
        <label className="block text-sm">
          <span className="text-gray-700 dark:text-gray-400">Rating</span>
          <StarRating
            rating={rating}
            onSetRating={setRating}
            size={20}
            maxRating={5}
          />
        </label>
        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Komen</span>
          <textarea
            className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-textarea focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray"
            rows="3"
            placeholder="Enter some long form content."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </label>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
