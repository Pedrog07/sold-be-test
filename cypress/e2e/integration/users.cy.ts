import { v4 as uuidv4 } from 'uuid';

describe(`User API Integration Tests`, () => {
  const user = {
    email: `${uuidv4()}@nestjs.com`,
    firstName: 'TestName',
    lastName: 'TestLastName',
    phone: '+12722348165',
    marketingSource: 'Facebook',
    birthDate: '2024-09-12T20:13:48.145Z',
  };

  let userId;

  it(`POST /users new user`, () => {
    cy.request({
      url: 'http://localhost:9000/users',
      method: 'post',
      body: user,
    }).then((res) => {
      userId = res.body._id;
      expect(res.status).eq(201);
      expect(res.body.email).to.be.eq(user.email);
    });
  });

  it(`POST /users existing user`, () => {
    cy.request({
      url: 'http://localhost:9000/users',
      method: 'post',
      body: user,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).eq(400);
      expect(res.body.message).to.be.eq(
        'There is already a user with that email address',
      );
    });
  });

  it(`PATCH /users/:id update user`, () => {
    cy.request({
      url: `http://localhost:9000/users/${userId}`,
      method: 'patch',
      body: { marketingSource: 'Instagram' },
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.marketingSource).to.be.eq('Instagram');
    });
  });

  it(`GET /users?firstName=TestName&limit=20&page=1&sort=-1&sortBy=createdAt get paginated users`, () => {
    cy.request({
      url: `http://localhost:9000/users?firstName=${user.firstName}&limit=20&page=1&sort=-1&sortBy=createdAt`,
      method: 'get',
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.page).to.eq(1);
      expect(res.body.limit).to.eq(20);
      expect(res.body.sort).to.eq(-1);
      expect(res.body.sortBy).to.eq('createdAt');
      expect(res.body.data.length).to.be.greaterThan(0);
      expect(
        res.body.data.every((user: any) => user.firstName.match(/TestName/i)),
      );
    });
  });

  it(`GET /users?lastName=TestLastName&limit=5&sort=1&sortBy=firstName get paginated users`, () => {
    cy.request({
      url: `http://localhost:9000/users?lastName=${user.lastName}&limit=5&sort=1&sortBy=firstName`,
      method: 'get',
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.page).to.eq(1);
      expect(res.body.limit).to.eq(5);
      expect(res.body.sort).to.eq(1);
      expect(res.body.sortBy).to.eq('firstName');
      expect(res.body.data.length).to.be.greaterThan(0);
      expect(
        res.body.data.every((user: any) =>
          user.lastName.match(/TestLastName/i),
        ),
      );
    });
  });

  it(`DELETE /users/:id delete user`, () => {
    cy.request({
      url: `http://localhost:9000/users/${userId}`,
      method: 'delete',
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body._id).to.be.eq(userId);
    });
  });

  it('POST /users/upload upload users with csv file', () => {
    const fileName = 'test-users-file.csv';
    const fileType = 'text/csv';
    const fileContent = `firstname,lastname,email,phone,status,provider,birth_date\nTestUploadUser,Test,${uuidv4()}@nestjs.com,+12722348165,,,2024-09-12T20:13:48.145Z`;

    const fileBlob = new Blob([fileContent], { type: fileType });

    const formDataToSend = new FormData();
    formDataToSend.append('file', fileBlob, fileName);

    cy.request({
      method: 'POST',
      url: `http://localhost:9000/users/upload`,
      body: formDataToSend,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      encoding: 'binary',
    }).then((res) => {
      const bodyString = Buffer.from(res.body).toString();
      const body = JSON.parse(bodyString);

      expect(res.status).eq(201);
      expect(body.successCount).to.be.eq(1);
      expect(body.failedCount).to.be.eq(0);
    });
  });
});
