import axios from "axios";
import React, { ChangeEvent, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import profile from "../img/profileImg.png";
import { RootState } from "../modules";
import {
  deleteMyInfoThunk,
  updateMyInfoPayloadType,
  updateMyInfoThunk,
} from "../modules/myInfo";
import "../scss/ModifyUserInfo.scss";

function ModifyUserInfo() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.login);
  const {
    myId,
    myName,
    nickname,
    profileUrl,
    introduction,
    status,
  } = useSelector((state: RootState) => state.myInfo);

  const [diffNickname, setDiffNickname] = useState(nickname);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [description, setDescription] = useState(introduction);
  const [isValidPw, setIsValidPw] = useState(true);
  const [isMatchPw, setIsMatchPw] = useState(true);
  const [imgFile, setImgFile] = useState<File | undefined>(undefined);
  const [previewURL, setPreviewURL] = useState<string | ArrayBuffer | null>(
    profileUrl
  );
  const [isValidNickname, setIsValidNickname] = useState(true);
  const [isModify, setIsModify] = useState(false);

  // const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (password !== confirmPw && confirmPw) {
      setIsMatchPw(false);
    } else if (password === confirmPw) {
      setIsMatchPw(true);
    }
    return () => {
      if (password !== confirmPw && confirmPw) {
        setIsMatchPw(false);
      } else if (password === confirmPw) {
        setIsMatchPw(true);
      }
    };
  }, [password, confirmPw]);

  useEffect(() => {
    if (isModify) {
      if (status === "failed") {
        setIsValidNickname(false);
      } else if (checkModified()) {
        history.push("/mypage");
      }
    }
  }, [status]);
  useEffect(() => {
    if (diffNickname !== nickname) {
      setIsValidNickname(true);
    }
  }, [diffNickname]);
  // useEffect(() => {
  //   console.log('isModify');
  //   if (status === 'failed') {
  //     console.log('isModify-fail');
  //     setIsValidNickname(false);
  //   } else if (diffNickname === nickname) {
  //     console.log('isModify-idle');
  //     // history.push('/mypage');
  //   }
  // }, [isModify]);

  const handleNickname = (e: ChangeEvent<HTMLInputElement>) => {
    setDiffNickname(e.target.value);
  };

  //비밀번호 유효성 검사
  const handlePW = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value === "") {
      setIsValidPw(true);
    } else {
      const regExp = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*()_+|<>?:{}]).*$/;
      if (regExp.test(e.target.value)) {
        setIsValidPw(true);
      } else {
        setIsValidPw(false);
      }
    }
  };
  const isPwMatches = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPw(e.target.value);
  };

  const handleIntroduction = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const reader = new FileReader();
    const fileList = e.target.files;
    console.log(fileList);

    reader.onloadend = () => {
      console.log("onloaded");

      if (!fileList) {
        console.log("!fileList");
        return;
      }
      setImgFile(fileList[0]);
      setPreviewURL(reader.result);
    };
    if (fileList) {
      console.log(fileList[0]);
      reader.readAsDataURL(fileList[0]);
    }
  };

  const resetImg = () => {
    setPreviewURL(profile);
  };

  const deleteAccount = async () => {
    const isDelete = confirm("정말로 탈퇴하시겠습니까?");
    if (isDelete) {
      const payload = {
        myId,
      };
      try {
        dispatch(deleteMyInfoThunk(payload));
        history.push("/");
      } catch (e) {
        console.log(e.response);
      }
    }
  };

  const checkModified = () => {
    if (
      (diffNickname !== nickname && isValidNickname) ||
      password ||
      description !== introduction ||
      imgFile ||
      previewURL === profile
    ) {
      return true;
    }
    return false;
  };

  const canPasswordSave = [isValidPw, isMatchPw, password].every(Boolean);

  const confirmModified = async () => {
    let profileUrl = "";
    if (imgFile) {
      const formData = new FormData();
      formData.append("image", imgFile);

      const res = await axios.post("/image", formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      profileUrl = res.data.data.profileUrl;
    }
    const payload: updateMyInfoPayloadType = {
      // nickname: diffNickname,
      introduction: description,
    };

    if (diffNickname !== nickname) {
      payload.nickname = diffNickname;
    }
    if (canPasswordSave) {
      payload.password = password;
    }
    if (profileUrl) {
      payload.profileUrl = profileUrl;
    }
    dispatch(updateMyInfoThunk(payload));
    setIsModify(true);
  };

  const isNotSocial = (id: string) => id.match(/[^0-9]/);

  return (
    <section className="modify-user">
      <article className="modify-user-wrap">
        <h2 className="modify-user__title">회원정보 수정</h2>
        <table className="table">
          <tbody>
            <tr className="table__name">
              <th className="table__th">
                <div className="table__th-cell">이름</div>
              </th>
              <td className="table__td">
                <div className="table__td-cell text">{myName}</div>
              </td>
            </tr>
            <tr className="table__name">
              <th className="table__th">
                <div className="table__th-cell">프로필 사진</div>
              </th>
              <td className="table__td">
                <div className="table__td-cell image">
                  <div className="table__td-cell__img-wrap">
                    <img
                      className="table__td-cell__img"
                      src={
                        // src 타입이 맞지 않아서 임시 수정 했습니다.
                        typeof previewURL === "string" ? previewURL : profile
                        // typeof previewURL === "string" ? previewURL : ""
                      }
                      alt="profile image"
                    />
                  </div>
                  <div className="profile__btn-wrap">
                    <label className="profile__btn change">
                      사진 변경
                      <input
                        type="file"
                        // accept="image/*"
                        className="profile__btn-input"
                        name="profile_img"
                        onChange={handleImgChange}
                      />
                    </label>
                    <button className="profile__btn delete" onClick={resetImg}>
                      삭제
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr className="table__nickname">
              <th className="table__th">
                <div className="table__th-cell">닉네임</div>
              </th>
              <td className="table__td">
                <div className="table__td-cell">
                  <input
                    className={
                      isValidNickname
                        ? "table__td-cell__nickname"
                        : "table__td-cell__nickname error"
                    }
                    type="text"
                    onChange={handleNickname}
                    value={diffNickname}
                  />
                  <div
                    className={
                      isValidNickname
                        ? "table__td-cell__caution"
                        : "table__td-cell__caution error"
                    }
                  >
                    {isValidNickname ? null : "닉네임이 중복됩니다."}
                  </div>
                </div>
              </td>
            </tr>
            {isNotSocial(myId) ? (
              <tr className="table__pw">
                <th className="table__th">
                  <div className="table__th-cell text">비밀번호 변경</div>
                </th>
                <td className="table__td">
                  <div className="table__td-cell">
                    <input
                      className={
                        isValidPw
                          ? "table__td-cell__pw"
                          : "table__td-cell__pw error"
                      }
                      type="password"
                      placeholder={"비밀번호를 입력해주세요"}
                      onChange={handlePW}
                    />
                    <div
                      className={
                        isValidPw
                          ? "table__td-cell__caution"
                          : "table__td-cell__caution error"
                      }
                    >
                      8-15자리의 영문/숫자/특수문자를 함께 입력해주세요.
                    </div>
                    <input
                      className={
                        isMatchPw
                          ? "table__td-cell__pw-confirm"
                          : "table__td-cell__pw-confirm error"
                      }
                      type="password"
                      placeholder={"입력하신 비밀번호를 다시 한번 입력해주세요"}
                      onChange={isPwMatches}
                    />
                    <div
                      className={
                        isMatchPw
                          ? "table__td-cell__caution"
                          : "table__td-cell__caution error"
                      }
                      // ref={errorRef}
                    >
                      {isMatchPw
                        ? null
                        : "입력하신 비밀번호가 일치하지 않습니다. 다시 확인해 주세요."}
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}
            <tr className="table__introduction">
              <th className="table__th">
                <div className="table__th-cell">자기 소개</div>
              </th>
              <td className="table__td">
                <div className="table__td-cell">
                  <textarea
                    name=""
                    id=""
                    cols={30}
                    rows={10}
                    onChange={handleIntroduction}
                    value={description ? description : ""}
                  >
                    {/* {description} */}
                  </textarea>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="delete__account">
          <span className="delete__info">
            넷프리뷰를 더 이상 이용하지 않는다면?
          </span>
          <span className="delete__account-btn" onClick={deleteAccount}>
            회원탈퇴 바로가기 {">>"}
          </span>
        </div>
        <div className="btn-wrap">
          <Link to="/mypage">
            <button className="btn btn-cancel">취소</button>
          </Link>
          {checkModified() ? (
            <button className="btn btn-save" onClick={confirmModified}>
              적용
            </button>
          ) : (
            <div className="btn-save no-change">적용</div>
          )}
        </div>
      </article>
    </section>
  );
}
export default ModifyUserInfo;
