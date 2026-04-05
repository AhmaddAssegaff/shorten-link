import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateLinkDto } from './app.dto';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const serviceMock = {
    getHello: jest.fn().mockReturnValue('Hello World!!!!!'),
    retrieveLinks: jest.fn(),
    createLinks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);

    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return "Hello World!!!!!"', () => {
      const result = appController.getHello();

      expect(result).toBe('Hello World!!!!!');
      expect(serviceMock.getHello).toHaveBeenCalledTimes(1);
    });
  });

  describe('get links', () => {
    it('should call retrieveLinks', async () => {
      await appController.getLinks();

      expect(serviceMock.retrieveLinks).toHaveBeenCalledTimes(1);
    });
  });

  describe('create link', () => {
    it('should call createLinks with DTO', async () => {
      const dto = new CreateLinkDto();
      await appController.postLinks(dto);

      expect(serviceMock.createLinks).toHaveBeenCalledWith(dto);
      expect(serviceMock.createLinks).toHaveBeenCalledTimes(1);
    });
  });
});
