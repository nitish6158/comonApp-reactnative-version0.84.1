// const lengt = [1,2,3,4,5]

export const calculateHeightWidth = (len, height, width) => {
  const totalElements = len.length;
  console.log("totalElements", totalElements, len);

  switch (totalElements) {
    case 1:
      return len.map((u) => ({
        uid: u,
        height,
        width,
      }));

    case 2:
      return len.map((u) => ({
        uid: u,
        height: height / 2,
        width,
      }));

    case 3:
      return len.map((u, i) => {
        if (i === 2) {
          return {
            uid: u,
            height: height / 2,
            width,
          };
        }
        return {
          uid: u,
          width: width / 2,
          height: height / 2,
        };
      });

    case 4:
      return len.map((u) => ({
        uid: u,
        height: height / 2,
        width: width / 2,
      }));

    case 5:
      return len.map((u, i) => {
        if (i < 3) {
          return {
            uid: u,
            height: height / 2,
            width: width / 3,
          };
        } else {
          return {
            uid: u,
            height: height / 2,
            width: width / 2,
          };
        }
      });

    case 6:
      return len.map((u) => ({
        uid: u,
        height: height / 2,
        width: width / 3,
      }));

    case 7:
      return len.map((u, i) => {
        if (i < 6) {
          return {
            uid: u,
            height: height / 3,
            width: width / 3,
          };
        } else {
          return {
            uid: u,
            height: height / 3,
            width,
          };
        }
      });

    case 8:
      return len.map((u, i) => {
        if (i < 6) {
          return {
            uid: u,
            height: height / 3,
            width: width / 3,
          };
        } else {
          return {
            uid: u,
            height: height / 3,
            width: width / 2,
          };
        }
      });

    case 9:
      return len.map((u) => ({
        uid: u,
        height: height / 3,
        width: width / 3,
      }));

    default:
      return len.length > 9
        ? len.slice(0, 9).map((u) => ({
            uid: u,
            height: height / 3,
            width: width / 3,
          }))
        : [];
  }
};

// console.log(calculateHeightWidth(lengt,100,100))
