const config = {
    omdbApiKey : ["9b5bbb4d","5ddb61e0","9864110d","674a49a1","683f6e4d","c23f9d93","f91867e6","3992a633","6fb1966b","78c4fcfe","deef2b57","d8dfc7d2","65eda47b","9258155a","a1bf60da","21dab8ad","26dc76ad","1ccef8ec","a48289b4","34930348","b161c004","6ed461f3","c9eac5b1","f36879a2","3e856977","6c09f680","42c2d312"],
    ytApiKey : ["AkIzaSyAV6-iVSy3e4h_8mimjZxWe5YfOJa9nLi8a","AcIzaSyCsE7qfpVLiKFYPZkBdgE2WdzwD6ldQUQMe","ANIzaSyCCQ3P8v0GGTKKYokZ5GCCDbD1mzwXOLSkr","AAIzaSyCZpwJmbEZtv1g_AyCZMaM99880AGrpn1Ub","ArIzaSyAUD-YQKEjCw3JuZ_2K1ck_CwwBga5ilF4i","AbIzaSyCw8r0dgxvC-Op5rTUkTQBVzN3N68sOnXQr","ARIzaSyDcZ4DMM-GrRQt4JHIhhDQENNIlzHSFHrkR","AIIzaSyBgwUI5yUVfZjAhUp5naxeqcHDwFeoHkIc2","AaIzaSyADzGW0StWhCJZdWk3QA3pg73leppLmg1os","AAIzaSyDFHIZot-B0MXLIs7oFqpW7zD55kenJTSAa","AoIzaSyD3eAB7aUmJiW2n9HEGbLsEve4wWRSeXRoa","AEIzaSyD8n1BzeCbrH58bZ2Q3niBtS2Yv9WgalYo3","AiIzaSyC4Ja1Heujs9Isp9BgE4LMfKAoAdq8m-Qst","ACIzaSyC4z_HtHWyw4mfq9BXoWfaVqmkyrUSI0ywX","AVIzaSyDttmTKIihCailgTiNtiuqATZX0mlJi4O8v"],
    backend : "https://recontent-backend.onrender.com/recommend"
};

function getNextOmdbApiKey() {
    const key = config.omdbApiKey[omdbApiKeyIndex];
    omdbApiKeyIndex = (omdbApiKeyIndex + 1) % config.omdbApiKey.length;
    console.log(omdbApiKeyIndex)
    return key;
}