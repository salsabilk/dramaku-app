function Comment({ avatar, name, comment, rating }) {
  return (
    <>
      <tr className="text-gray-700 dark:text-gray-400">
        <td className="px-4 py-3">
          <div className="flex items-center text-sm">
            <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
              <img
                className="object-cover w-full h-full rounded-full"
                src={avatar}
                alt=""
                loading="lazy"
              />
              <div
                className="absolute inset-0 rounded-full shadow-inner"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {comment}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-right">{rating}</td>
      </tr>
    </>
  );
}

export default Comment;
