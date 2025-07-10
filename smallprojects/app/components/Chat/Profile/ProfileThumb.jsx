import Link from 'next/link';
import React from 'react';

import styles from './ProfileThumb.module.css';

function ProfileThumb({
  src = null,
  size = 'medium',
  link = null,
  alt = '',
  shadow = true,
  online = false,

  disabled = false,
}) {
  if (src === null) {
    const randomSizeWidth =
      Math.floor(Math.random() * 101) + 100;
    const randomSizeHeight =
      Math.floor(Math.random() * 101) + 100;

    src = `https://picsum.photos/${randomSizeWidth}/${randomSizeHeight}`;
  }

  const profileThumbClass = `${styles.profileThumb} ${styles[size]} ${shadow ? styles.shadow : ''} ${
    online ? styles.online : ''
  } ${disabled ? styles.disabled : ''}`;

  const handleClick = (e) => {
    if (typeof link === 'function') {
      e.preventDefault();

      link();
    }
  };

  return (
    <>
      {link ? (
        typeof link === 'string' ? (
          <Link href={link} className={profileThumbClass}>
            <div className={styles.profileImage}>
              {online && (
                <div className={styles.onlineCircle}></div>
              )}
              <img src={src} alt={alt} />
            </div>
          </Link>
        ) : (
          <div
            className={profileThumbClass}
            onClick={handleClick}
          >
            <div className={styles.profileImage}>
              {online && (
                <div className={styles.onlineCircle}></div>
              )}
              <img src={src} alt={alt} />
            </div>
          </div>
        )
      ) : (
        <div className={profileThumbClass}>
          <div className={styles.profileImage}>
            {online && (
              <div className={styles.onlineCircle}></div>
            )}
            <img src={src} alt={alt} />
          </div>
        </div>
      )}
    </>
  );
}

// Memoize the ProfileThumb component
export default React.memo(ProfileThumb); // So the component doesn't re-render if the props don't change
