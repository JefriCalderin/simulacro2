// Animación del SVG de la pantalla de login.
// Código detallado: lo dejamos para la UX, con comentarios mínimos.
let face = {};

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y1 - y2, x1 - x2);
}

function getPosition(el) {
  let xPos = 0, yPos = 0;
  while (el) {
    if (el.tagName === 'BODY') {
      xPos += el.offsetLeft - (el.scrollLeft || document.documentElement.scrollLeft) + el.clientLeft;
      yPos += el.offsetTop - (el.scrollTop || document.documentElement.scrollTop) + el.clientTop;
    } else {
      xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
      yPos += el.offsetTop - el.scrollTop + el.clientTop;
    }
    el = el.offsetParent;
  }
  return { x: xPos, y: yPos };
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function isMobileDevice() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /android|bb\d+|meego|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(ua);
}

function calculateFaceMove() {
  const { email, svgCoords, emailCoords, screenCenter, eyeLCoords, eyeRCoords, noseCoords, mouthCoords, emailScrollMax } = face;
  const carPos = email.selectionEnd != null ? email.selectionEnd : email.value.length;

  const div = document.createElement('div');
  const span = document.createElement('span');
  const copyStyle = getComputedStyle(email);

  [].forEach.call(copyStyle, p => { div.style[p] = copyStyle[p]; });
  div.style.position = 'absolute';
  document.body.appendChild(div);
  div.textContent = email.value.substr(0, carPos);
  span.textContent = email.value.substr(carPos) || '.';
  div.appendChild(span);

  let eLA, eRA, nA, mA;
  if (email.scrollWidth <= emailScrollMax) {
    const caret = getPosition(span);
    eLA = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + caret.x, emailCoords.y + 25);
    eRA = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + caret.x, emailCoords.y + 25);
    nA = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + caret.x, emailCoords.y + 25);
    mA = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + caret.x, emailCoords.y + 25);
  } else {
    eLA = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
    eRA = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
    nA = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
    mA = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
  }

  const eLX = Math.cos(eLA) * 20, eLY = Math.sin(eLA) * 10;
  const eRX = Math.cos(eRA) * 20, eRY = Math.sin(eRA) * 10;
  const nX = Math.cos(nA) * 23, nY = Math.sin(nA) * 10;
  const mX = Math.cos(mA) * 23, mY = Math.sin(mA) * 10;
  const mR = Math.cos(mA) * 6;
  const cX = mX * 0.8, cY = mY * 0.5;
  let cS = 1 - ((screenCenter - (emailCoords.x + email.selectionEnd)) * 0.15 / 100);
  if (cS > 1) cS = 1 - (cS - 1);
  if (cS < 0.5) cS = 0.5;

  TweenMax.to(face.eyeL, 1, { x: -eLX, y: -eLY, ease: Expo.easeOut });
  TweenMax.to(face.eyeR, 1, { x: -eRX, y: -eRY, ease: Expo.easeOut });
  TweenMax.to(face.nose, 1, { x: -nX, y: -nY, rotation: mR, transformOrigin: 'center center', ease: Expo.easeOut });
  TweenMax.to(face.mouth, 1, { x: -mX, y: -mY, rotation: mR, transformOrigin: 'center center', ease: Expo.easeOut });
  TweenMax.to(face.chin, 1, { x: -cX, y: -cY, scaleY: cS, ease: Expo.easeOut });
  TweenMax.to(face.face, 1, { x: -mX * 0.3, y: -mY * 0.4, skewX: -Math.cos(mA) * 5, transformOrigin: 'center top', ease: Expo.easeOut });
  TweenMax.to(face.eyebrow, 1, { x: -mX * 0.3, y: -mY * 0.4, skewX: -Math.cos(mA) * 25, transformOrigin: 'center top', ease: Expo.easeOut });
  TweenMax.to(face.outerEarL, 1, { x: Math.cos(mA) * 4, y: -Math.cos(mA) * 5, ease: Expo.easeOut });
  TweenMax.to(face.outerEarR, 1, { x: Math.cos(mA) * 4, y: Math.cos(mA) * 5, ease: Expo.easeOut });
  TweenMax.to(face.earHairL, 1, { x: -Math.cos(mA) * 4, y: -Math.cos(mA) * 5, ease: Expo.easeOut });
  TweenMax.to(face.earHairR, 1, { x: -Math.cos(mA) * 4, y: Math.cos(mA) * 5, ease: Expo.easeOut });
  TweenMax.to(face.hair, 1, { x: Math.cos(mA) * 6, scaleY: 1.2, transformOrigin: 'center bottom', ease: Expo.easeOut });

  document.body.removeChild(div);
}

function onEmailInput() {
  calculateFaceMove();
  const length = face.email.value.length;

  if (length > 0) {
    if (face.mouthStatus === 'small') {
      face.mouthStatus = 'medium';
      TweenMax.to([face.mouthBG, face.mouthOutline, face.mouthMaskPath], 1, { morphSVG: face.mouthMediumBG, shapeIndex: 8, ease: Expo.easeOut });
      TweenMax.to(face.tooth, 1, { x: 0, y: 0, ease: Expo.easeOut });
      TweenMax.to(face.tongue, 1, { x: 0, y: 1, ease: Expo.easeOut });
      TweenMax.to([face.eyeL, face.eyeR], 1, { scaleX: 0.85, scaleY: 0.85, ease: Expo.easeOut });
    }
    face.mouthStatus = 'large';
    TweenMax.to([face.mouthBG, face.mouthOutline, face.mouthMaskPath], 1, { morphSVG: face.mouthLargeBG, ease: Expo.easeOut });
    TweenMax.to(face.tooth, 1, { x: 3, y: -2, ease: Expo.easeOut });
    TweenMax.to(face.tongue, 1, { y: 2, ease: Expo.easeOut });
    TweenMax.to([face.eyeL, face.eyeR], 1, { scaleX: 0.65, scaleY: 0.65, ease: Expo.easeOut, transformOrigin: 'center center' });
  } else {
    face.mouthStatus = 'small';
    TweenMax.to([face.mouthBG, face.mouthOutline, face.mouthMaskPath], 1, { morphSVG: face.mouthSmallBG, shapeIndex: 9, ease: Expo.easeOut });
    TweenMax.to(face.tooth, 1, { x: 0, y: 0, ease: Expo.easeOut });
    TweenMax.to(face.tongue, 1, { y: 0, ease: Expo.easeOut });
    TweenMax.to([face.eyeL, face.eyeR], 1, { scaleX: 1, scaleY: 1, ease: Expo.easeOut });
  }
}

function spreadFingers() {
  TweenMax.to(face.twoFingers, 0.35, { transformOrigin: 'bottom left', rotation: 30, x: -9, y: -2, ease: Power2.easeInOut });
}

function closeFingers() {
  TweenMax.to(face.twoFingers, 0.35, { transformOrigin: 'bottom left', rotation: 0, x: 0, y: 0, ease: Power2.easeInOut });
}

function coverEyes() {
  TweenMax.killTweensOf([face.armL, face.armR]);
  TweenMax.set([face.armL, face.armR], { visibility: 'visible' });
  TweenMax.to(face.armL, 0.45, { x: -93, y: 10, rotation: 0, ease: Quad.easeOut });
  TweenMax.to(face.armR, 0.45, { x: -93, y: 10, rotation: 0, ease: Quad.easeOut, delay: 0.1 });
  TweenMax.to(face.bodyBG, 0.45, { morphSVG: face.bodyBGchanged, ease: Quad.easeOut });
  face.eyesCovered = true;
}

function uncoverEyes() {
  TweenMax.killTweensOf([face.armL, face.armR]);
  TweenMax.to(face.armL, 1.35, { y: 220, ease: Quad.easeOut });
  TweenMax.to(face.armL, 1.35, { rotation: 105, ease: Quad.easeOut, delay: 0.1 });
  TweenMax.to(face.armR, 1.35, { y: 220, ease: Quad.easeOut });
  TweenMax.to(face.armR, 1.35, { rotation: -105, ease: Quad.easeOut, delay: 0.1, onComplete() {
    TweenMax.set([face.armL, face.armR], { visibility: 'hidden' });
  }});
  TweenMax.to(face.bodyBG, 0.45, { morphSVG: face.bodyBG, ease: Quad.easeOut });
  face.eyesCovered = false;
}

function resetFace() {
  TweenMax.to([face.eyeL, face.eyeR], 1, { x: 0, y: 0, ease: Expo.easeOut });
  TweenMax.to(face.nose, 1, { x: 0, y: 0, scaleX: 1, scaleY: 1, ease: Expo.easeOut });
  TweenMax.to(face.mouth, 1, { x: 0, y: 0, rotation: 0, ease: Expo.easeOut });
  TweenMax.to(face.chin, 1, { x: 0, y: 0, scaleY: 1, ease: Expo.easeOut });
  TweenMax.to([face.face, face.eyebrow], 1, { x: 0, y: 0, skewX: 0, ease: Expo.easeOut });
  TweenMax.to([face.outerEarL, face.outerEarR, face.earHairL, face.earHairR, face.hair], 1, { x: 0, y: 0, scaleY: 1, ease: Expo.easeOut });
}

function startBlinking(delay) {
  const d = delay ? getRandomInt(delay) : 1;
  face.blinking = TweenMax.to([face.eyeL, face.eyeR], 0.1, {
    delay: d, scaleY: 0, yoyo: true, repeat: 1, transformOrigin: 'center center',
    onComplete() { startBlinking(12); }
  });
}

export function initFaceAnimation() {
  // Resetear el flag para permitir reinicialización en cada login
  face.initialized = true;

  try {
    face.email = document.getElementById('loginEmail');
    face.emailLabel = document.getElementById('loginEmailLabel');
    face.password = document.getElementById('loginPassword');
    face.showPasswordCheck = document.getElementById('showPasswordCheck');
    face.mySVG = document.querySelector('.svgContainer');
    face.twoFingers = document.querySelector('.twoFingers');
    face.armL = document.querySelector('.armL');
    face.armR = document.querySelector('.armR');
    face.eyeL = document.querySelector('.eyeL');
    face.eyeR = document.querySelector('.eyeR');
    face.nose = document.querySelector('.nose');
    face.mouth = document.querySelector('.mouth');
    face.mouthBG = document.querySelector('.mouthBG');
    face.mouthSmallBG = document.querySelector('.mouthSmallBG');
    face.mouthMediumBG = document.querySelector('.mouthMediumBG');
    face.mouthLargeBG = document.querySelector('.mouthLargeBG');
    face.mouthMaskPath = document.querySelector('#mouthMaskPath');
    face.mouthOutline = document.querySelector('.mouthOutline');
    face.tooth = document.querySelector('.tooth');
    face.tongue = document.querySelector('.tongue');
    face.chin = document.querySelector('.chin');
    face.face = document.querySelector('.face');
    face.eyebrow = document.querySelector('.eyebrow');
    face.outerEarL = document.querySelector('.earL .outerEar');
    face.outerEarR = document.querySelector('.earR .outerEar');
    face.earHairL = document.querySelector('.earL .earHair');
    face.earHairR = document.querySelector('.earR .earHair');
    face.hair = document.querySelector('.hair');
    face.bodyBG = document.querySelector('.bodyBGnormal');
    face.bodyBGchanged = document.querySelector('.bodyBGchanged');
    face.mouthStatus = 'small';
    face.eyesCovered = false;

    if (!face.email || !face.password || !face.showPasswordCheck) return;

    const svgCoords = getPosition(face.mySVG);
    const emailCoords = getPosition(face.email);
    face.svgCoords = svgCoords;
    face.emailCoords = emailCoords;
    face.screenCenter = svgCoords.x + (face.mySVG.offsetWidth / 2);
    face.eyeLCoords = { x: svgCoords.x + 84, y: svgCoords.y + 76 };
    face.eyeRCoords = { x: svgCoords.x + 113, y: svgCoords.y + 76 };
    face.noseCoords = { x: svgCoords.x + 97, y: svgCoords.y + 81 };
    face.mouthCoords = { x: svgCoords.x + 100, y: svgCoords.y + 100 };
    face.emailScrollMax = face.email.scrollWidth;

    face.email.addEventListener('focus', () => {
      face.email.parentElement.classList.add('focusWithText');
      onEmailInput();
    });
    face.email.addEventListener('blur', () => {
      setTimeout(() => {
        if (face.email.value === '') face.email.parentElement.classList.remove('focusWithText');
        resetFace();
      }, 100);
    });
    face.email.addEventListener('input', onEmailInput);
    if (face.emailLabel) face.emailLabel.addEventListener('click', () => {});

    face.password.addEventListener('focus', () => {
      if (!face.eyesCovered) coverEyes();
    });
    face.password.addEventListener('blur', () => {
      setTimeout(() => {
        if (face.showPasswordCheck !== document.activeElement) uncoverEyes();
      }, 100);
    });

    face.showPasswordCheck.addEventListener('change', (e) => {
      setTimeout(() => {
        face.password.type = e.target.checked ? 'text' : 'password';
        if (e.target.checked && typeof spreadFingers === 'function') spreadFingers();
        else if (typeof closeFingers === 'function') closeFingers();
      }, 100);
    });
    face.showPasswordCheck.addEventListener('focus', () => {
      if (!face.eyesCovered) coverEyes();
    });
    face.showPasswordCheck.addEventListener('blur', () => {
      setTimeout(() => {
        if (face.password !== document.activeElement) uncoverEyes();
      }, 100);
    });

    TweenMax.set(face.armL, { x: -93, y: 220, rotation: 105, transformOrigin: 'top left' });
    TweenMax.set(face.armR, { x: -93, y: 220, rotation: -105, transformOrigin: 'top right' });
    TweenMax.set(face.mouth, { transformOrigin: 'center center' });

    startBlinking(5);

    if (isMobileDevice()) {
      face.password.type = 'text';
      face.showPasswordCheck.checked = true;
      TweenMax.set(face.twoFingers, { transformOrigin: 'bottom left', rotation: 30, x: -9, y: -2 });
    }
  } catch (err) {
    console.warn('Face animation init error:', err);
  }
}
