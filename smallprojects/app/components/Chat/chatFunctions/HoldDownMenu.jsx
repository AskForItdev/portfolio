/* HoldDownMenu props:

    data: Data to pass to the menu
    buttons: Array of objects with button data
    visible: Show or hide the menu
    setShow: Function to set the menu visibility
    sound: true/false if sound should play when a button is clicked and hovered
*/

import styles from './HoldDownMenu.module.css';

export default function HoldDownMenu({
  data = null,
  buttons = [],
  visible = false,
  setShow = null,
}) {
  // Handle closing the menu after an action
  const handleShow = () => {
    if (typeof setShow === 'function') {
      setShow(false); // Close the menu
    }
  };

  // Handle menu item actions
  const handleClick = (button) => {
    if (typeof button.action === 'function') {
      button.action(data); // Execute the action directly
      handleShow(); // Close the menu after executing the action
    } else {
      console.error('Action is not a function:', button);
    }
  };

  return (
    <>
      {visible && buttons.length > 0 && (
        <>
          <div className="">
            <ul className="">
              {buttons.map((button, index) => (
                <li
                  key={index}
                  className={styles.menuItem}
                  onClick={() => handleClick(button)}
                >
                  {button.icon && (
                    <span className="">{button.icon}</span>
                  )}
                  <span className="">{button.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="" onClick={handleShow}></div>
        </>
      )}
      {visible && buttons.length > 1 && (
        <>
          <div className="">
            <ul className="">
              {buttons.map((button, index) => (
                <li
                  key={index}
                  className=""
                  onClick={() => handleClick(button)}
                >
                  {button.icon && (
                    <span className="">{button.icon}</span>
                  )}
                  <span className="">{button.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="" onClick={handleShow}></div>
        </>
      )}
    </>
  );
}
