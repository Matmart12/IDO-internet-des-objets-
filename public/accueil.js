async function session() {
    const sessionCheck = await fetch('http://localhost:5000/check-session', {
      credentials: 'include'
    });
    const sessionData = await sessionCheck.json();
  
    if (sessionData.isLoggedIn) {
      return sessionData.id;
    } else {
      return -1;
    }
  }


  
  console.log(session())