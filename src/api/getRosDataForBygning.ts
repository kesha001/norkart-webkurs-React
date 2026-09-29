export const getRosDataForBygning = async (bygningsNr: number) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  const query = `https://ros.api.norkart.no/v2/ros/bygning/${bygningsNr}`;

  // TODO: Fullfør/endre koden for hente og returnere risiko- og sårbarhetsdata (ROS-data) for en bygning

  // Hint: Du kan se på getAdresseFromSearchText og getHoydeFromPunkt for å få en idé om hvordan
  // dette kan gjøres.

  // Merk at dette er en GET request, og ikke en POST request!

  // Når du har fått til kallet til API-et kan du se i Network-taben i nettleseren eller i
  // konsollen for å se hvordan responsen ser ut.

  try {
    const apiResult = await fetch(query, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-WAAPI-TOKEN': `${apiKey}`,
      },
    });

    if (apiResult.ok) {
      const data = await apiResult.json();
      return data.Options;
    } else {
      console.error('API request failed with status:', apiResult.status);
      return [];
    }
  } catch (error) {
    console.error('An error occurred while fetching data:', error);
    return [];
  }
};
